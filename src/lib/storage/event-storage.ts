import { EventDetails, TimelineMilestone, BudgetItem, VendorChecklistItem } from "@/types/event";
import { SAMPLE_EVENTS } from "./sample-data";
import { 
  saveEventToFirebase, 
  deleteEventFromFirebase, 
  syncLocalEventsToFirebase, 
  subscribeToFirebaseEvents 
} from "@/lib/firebase";

export const STORAGE_KEY_V1 = "eventora_events_v1";

export interface IEventRepository {
  getAll(): EventDetails[];
  getById(id: string): EventDetails | null;
  save(event: EventDetails): boolean;
  delete(id: string): boolean;
  toggleTask(eventId: string, taskId: string, type: "milestone" | "vendor"): boolean;
  addTask(eventId: string, task: Omit<TimelineMilestone, "id">): boolean;
  updateTask(eventId: string, task: TimelineMilestone): boolean;
  deleteTask(eventId: string, taskId: string): boolean;
  saveBudgetItem(eventId: string, item: BudgetItem): boolean;
  deleteBudgetItem(eventId: string, itemId: string): boolean;
  saveVendor(eventId: string, vendor: VendorChecklistItem): boolean;
  deleteVendor(eventId: string, vendorId: string): boolean;
  clear(): boolean;
  resetSamples(): boolean;
  initSync(): void;
}

/**
 * Checks if browser localStorage is available and functional
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__storage_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes raw JSON data from storage into safe EventDetails structures.
 */
function sanitizeEventRecord(raw: unknown): EventDetails | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  if (typeof item.id !== "string" || !item.id.trim()) return null;
  if (typeof item.title !== "string" || !item.title.trim()) return null;

  const validTypes = ["wedding", "birthday", "community", "other"];
  const eventType = validTypes.includes(item.eventType as string)
    ? (item.eventType as EventDetails["eventType"])
    : "other";

  const date = typeof item.date === "string" ? item.date : "";
  const location = typeof item.location === "string" ? item.location : "TBD";
  const guestCount = typeof item.guestCount === "number" && !isNaN(item.guestCount) ? Math.max(1, item.guestCount) : 50;
  const targetBudget = typeof item.targetBudget === "number" && !isNaN(item.targetBudget) ? Math.max(0, item.targetBudget) : 1000;
  const currency = typeof item.currency === "string" ? (item.currency as EventDetails["currency"]) : "USD";
  const status = typeof item.status === "string" ? (item.status as EventDetails["status"]) : "planning";
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString();
  const updatedAt = typeof item.updatedAt === "string" ? item.updatedAt : createdAt;

  return {
    id: item.id,
    title: item.title,
    eventType,
    date,
    location,
    guestCount,
    targetBudget,
    currency,
    budgetPriorities: Array.isArray(item.budgetPriorities) ? (item.budgetPriorities as string[]) : undefined,
    themePreference: typeof item.themePreference === "string" ? item.themePreference : undefined,
    atmosphere: typeof item.atmosphere === "string" ? item.atmosphere : undefined,
    cateringRequirements: typeof item.cateringRequirements === "string" ? item.cateringRequirements : undefined,
    dietaryRestrictions: typeof item.dietaryRestrictions === "string" ? item.dietaryRestrictions : undefined,
    entertainmentPreferences: typeof item.entertainmentPreferences === "string" ? item.entertainmentPreferences : undefined,
    notes: typeof item.notes === "string" ? item.notes : undefined,
    status,
    plan: item.plan && typeof item.plan === "object" ? (item.plan as EventDetails["plan"]) : undefined,
    createdAt,
    updatedAt,
  };
}

class HybridEventRepository implements IEventRepository {
  private syncStarted = false;
  private unsubscribeFirebase: (() => void) | null = null;

  private notifyListeners(): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("eventora_storage_updated"));
    }
  }

  /**
   * Initializes background sync with Firebase RTDB:
   * 1. Subscribes to realtime events under users/{uid}/events
   * 2. Migrates local events to Firebase if not yet synced
   */
  async initSync(): Promise<void> {
    if (typeof window === "undefined" || this.syncStarted) return;
    this.syncStarted = true;

    try {
      // Setup realtime listener from Firebase
      this.unsubscribeFirebase = await subscribeToFirebaseEvents((remoteEvents) => {
        if (remoteEvents && remoteEvents.length > 0) {
          // Update local cache
          if (isStorageAvailable()) {
            window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(remoteEvents));
          }
          this.notifyListeners();
        }
      });

      // Migrate existing local events to Firebase
      const local = this.getAll();
      if (local.length > 0) {
        await syncLocalEventsToFirebase(local);
      }
    } catch (err) {
      console.warn("[Eventora Sync] Firebase sync error:", err);
    }
  }

  getAll(): EventDetails[] {
    if (!isStorageAvailable()) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_V1);
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(SAMPLE_EVENTS));
        return SAMPLE_EVENTS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const sanitized: EventDetails[] = [];
      for (const item of parsed) {
        const clean = sanitizeEventRecord(item);
        if (clean) sanitized.push(clean);
      }
      return sanitized;
    } catch (err) {
      console.error("LocalStorage parse failure:", err);
      return [];
    }
  }

  getById(id: string): EventDetails | null {
    if (!id) return null;
    const events = this.getAll();
    return events.find((e) => e.id === id) || null;
  }

  save(event: EventDetails): boolean {
    if (!isStorageAvailable()) return false;
    try {
      const events = this.getAll();
      const existingIdx = events.findIndex((e) => e.id === event.id);

      const normalized: EventDetails = {
        ...event,
        updatedAt: new Date().toISOString(),
        createdAt: event.createdAt || new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        events[existingIdx] = normalized;
      } else {
        events.push(normalized);
      }

      window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(events));
      this.notifyListeners();

      // Async write to Firebase Realtime Database
      saveEventToFirebase(normalized).catch((err) => {
        console.warn("[Eventora RTDB] Background sync error:", err);
      });

      return true;
    } catch (err) {
      console.error("LocalStorage save failure:", err);
      return false;
    }
  }

  delete(id: string): boolean {
    if (!isStorageAvailable() || !id) return false;
    try {
      const events = this.getAll();
      const filtered = events.filter((e) => e.id !== id);
      window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(filtered));
      this.notifyListeners();

      // Async delete from Firebase Realtime Database
      deleteEventFromFirebase(id).catch((err) => {
        console.warn("[Eventora RTDB] Background delete error:", err);
      });

      return true;
    } catch (err) {
      console.error("LocalStorage delete failure:", err);
      return false;
    }
  }

  toggleTask(eventId: string, taskId: string, type: "milestone" | "vendor"): boolean {
    const event = this.getById(eventId);
    if (!event || !event.plan) return false;

    if (type === "milestone" && event.plan.timeline) {
      event.plan.timeline = event.plan.timeline.map((m) =>
        m.id === taskId ? { ...m, isCompleted: !m.isCompleted } : m
      );
      return this.save(event);
    }

    if (type === "vendor" && event.plan.vendorChecklist) {
      event.plan.vendorChecklist = event.plan.vendorChecklist.map((v) =>
        v.id === taskId
          ? { ...v, status: v.status === "confirmed" ? "booked" : "confirmed" }
          : v
      );
      return this.save(event);
    }

    return false;
  }

  addTask(eventId: string, task: Omit<TimelineMilestone, "id">): boolean {
    const event = this.getById(eventId);
    if (!event) return false;

    if (!event.plan) {
      event.plan = {
        theme: event.themePreference || "Celebration Plan",
        summary: `Planning roadmap for ${event.title}`,
        recommendations: [],
        budgetBreakdown: [],
        timeline: [],
        vendorChecklist: [],
        suggestedSchedule: [],
      };
    }

    const newTask: TimelineMilestone = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    event.plan.timeline = [...(event.plan.timeline || []), newTask];
    return this.save(event);
  }

  updateTask(eventId: string, task: TimelineMilestone): boolean {
    const event = this.getById(eventId);
    if (!event || !event.plan?.timeline) return false;

    event.plan.timeline = event.plan.timeline.map((m) =>
      m.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : m
    );
    return this.save(event);
  }

  deleteTask(eventId: string, taskId: string): boolean {
    const event = this.getById(eventId);
    if (!event || !event.plan?.timeline) return false;

    event.plan.timeline = event.plan.timeline.filter((m) => m.id !== taskId);
    return this.save(event);
  }

  saveBudgetItem(eventId: string, item: BudgetItem): boolean {
    const event = this.getById(eventId);
    if (!event) return false;

    if (!event.plan) {
      event.plan = {
        theme: event.themePreference || "Celebration Plan",
        summary: `Planning roadmap for ${event.title}`,
        recommendations: [],
        budgetBreakdown: [],
        timeline: [],
        vendorChecklist: [],
        suggestedSchedule: [],
      };
    }

    const items = event.plan.budgetBreakdown || [];
    const existingIdx = items.findIndex((b) => b.id === item.id);

    if (existingIdx >= 0) {
      items[existingIdx] = item;
    } else {
      items.push(item);
    }

    event.plan.budgetBreakdown = items;
    return this.save(event);
  }

  deleteBudgetItem(eventId: string, itemId: string): boolean {
    const event = this.getById(eventId);
    if (!event || !event.plan?.budgetBreakdown) return false;

    event.plan.budgetBreakdown = event.plan.budgetBreakdown.filter((b) => b.id !== itemId);
    return this.save(event);
  }

  saveVendor(eventId: string, vendor: VendorChecklistItem): boolean {
    const event = this.getById(eventId);
    if (!event) return false;

    if (!event.plan) {
      event.plan = {
        theme: event.themePreference || "Celebration Plan",
        summary: `Planning roadmap for ${event.title}`,
        recommendations: [],
        budgetBreakdown: [],
        timeline: [],
        vendorChecklist: [],
        suggestedSchedule: [],
      };
    }

    const vendors = event.plan.vendorChecklist || [];
    const existingIdx = vendors.findIndex((v) => v.id === vendor.id);

    if (existingIdx >= 0) {
      vendors[existingIdx] = vendor;
    } else {
      vendors.push(vendor);
    }

    event.plan.vendorChecklist = vendors;
    return this.save(event);
  }

  deleteVendor(eventId: string, vendorId: string): boolean {
    const event = this.getById(eventId);
    if (!event || !event.plan?.vendorChecklist) return false;

    event.plan.vendorChecklist = event.plan.vendorChecklist.filter((v) => v.id !== vendorId);
    return this.save(event);
  }

  clear(): boolean {
    if (!isStorageAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify([]));
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error("LocalStorage clear failure:", err);
      return false;
    }
  }

  resetSamples(): boolean {
    if (!isStorageAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(SAMPLE_EVENTS));
      this.notifyListeners();
      return true;
    } catch (err) {
      console.error("LocalStorage reset failure:", err);
      return false;
    }
  }
}

export const eventRepository: IEventRepository = new HybridEventRepository();

// Legacy function aliases for backwards compatibility
export const getSavedEvents = () => eventRepository.getAll();
export const getEventById = (id: string) => eventRepository.getById(id);
export const saveEvent = (event: EventDetails) => eventRepository.save(event);
export const deleteEvent = (id: string) => eventRepository.delete(id);
export const clearAllEvents = () => eventRepository.clear();
export const resetSampleEvents = () => eventRepository.resetSamples();
