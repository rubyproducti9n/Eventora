export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskCategory = "planning" | "booking" | "preparation" | "day_of";

export type VendorStatus = "needed" | "contacted" | "booked" | "confirmed";

export interface TimelineMilestone {
  id: string;
  timeframe: string; // e.g. "4 Weeks Before", "2026-11-20"
  title: string;
  description: string;
  isCompleted: boolean;
  category: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string; // ISO date string "YYYY-MM-DD"
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorChecklistItem {
  id: string;
  role: string; // e.g. "Caterer", "Photographer", "Florist"
  status: VendorStatus;
  category?: string;
  notes?: string;
  estimatedCost?: number;
  contactName?: string;
  phoneOrEmail?: string;
  isPaid?: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  allocatedAmount: number;
  actualAmount?: number;
  isPaid?: boolean;
}

export interface GeneratedEventPlan {
  theme: string;
  summary: string;
  recommendations: string[];
  budgetBreakdown: BudgetItem[];
  timeline: TimelineMilestone[];
  vendorChecklist: VendorChecklistItem[];
  suggestedSchedule: { time: string; activity: string }[];
  practicalNotes?: string[];
  generationMode?: "live_ai" | "demo_mode";
  generatedAt?: string;
}

export type EventType = "wedding" | "birthday" | "community" | "other";

export type EventStatus = "draft" | "planning" | "ready" | "completed";

export type SupportedCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR";

export interface EventDetails {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  targetBudget: number;
  currency?: SupportedCurrency;
  budgetPriorities?: string[];
  atmosphere?: string;
  cateringRequirements?: string;
  dietaryRestrictions?: string;
  entertainmentPreferences?: string;
  notes?: string;
  themePreference?: string;
  status: EventStatus;
  plan?: GeneratedEventPlan;
  createdAt: string;
  updatedAt: string;
}
