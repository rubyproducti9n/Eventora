import { ref, set, get, remove, onValue, off, DatabaseReference } from "firebase/database";
import { getFirebaseDb } from "./config";
import { getOrCreateAnonymousUser } from "./auth";
import { EventDetails } from "@/types/event";
import { trackAppEvent } from "./analytics";

const MIGRATION_FLAG_KEY = "eventora_firebase_migrated_v1";

/**
 * Returns a reference to a user-scoped database path: `users/{uid}/events`
 */
async function getUserEventsRef(): Promise<{ dbRef: DatabaseReference; uid: string } | null> {
  const user = await getOrCreateAnonymousUser();
  if (!user) return null;

  const db = getFirebaseDb();
  if (!db) return null;

  return {
    dbRef: ref(db, `users/${user.uid}/events`),
    uid: user.uid,
  };
}

/**
 * Saves or updates an event in Firebase Realtime Database.
 */
export async function saveEventToFirebase(event: EventDetails): Promise<boolean> {
  try {
    const userEvents = await getUserEventsRef();
    if (!userEvents) return false;

    const eventRef = ref(getFirebaseDb()!, `users/${userEvents.uid}/events/${event.id}`);
    await set(eventRef, event);
    return true;
  } catch (err) {
    console.warn("[Eventora RTDB] Failed to save event to Firebase:", err);
    return false;
  }
}

/**
 * Deletes an event from Firebase Realtime Database.
 */
export async function deleteEventFromFirebase(eventId: string): Promise<boolean> {
  try {
    const userEvents = await getUserEventsRef();
    if (!userEvents) return false;

    const eventRef = ref(getFirebaseDb()!, `users/${userEvents.uid}/events/${eventId}`);
    await remove(eventRef);
    trackAppEvent("delete_event");
    return true;
  } catch (err) {
    console.warn("[Eventora RTDB] Failed to delete event from Firebase:", err);
    return false;
  }
}

/**
 * Retrieves all events for the authenticated user from Firebase Realtime Database.
 */
export async function fetchUserEventsFromFirebase(): Promise<EventDetails[] | null> {
  try {
    const userEvents = await getUserEventsRef();
    if (!userEvents) return null;

    const snapshot = await get(userEvents.dbRef);
    if (!snapshot.exists()) return [];

    const val = snapshot.val();
    if (!val || typeof val !== "object") return [];

    return Object.values(val) as EventDetails[];
  } catch (err) {
    console.warn("[Eventora RTDB] Failed to fetch events from Firebase:", err);
    return null;
  }
}

/**
 * Subscribes to realtime updates under `users/{uid}/events`.
 */
export async function subscribeToFirebaseEvents(
  onUpdate: (events: EventDetails[]) => void
): Promise<() => void> {
  const userEvents = await getUserEventsRef();
  if (!userEvents) return () => {};

  const listener = onValue(userEvents.dbRef, (snapshot) => {
    if (!snapshot.exists()) {
      onUpdate([]);
      return;
    }
    const val = snapshot.val();
    const list = val && typeof val === "object" ? (Object.values(val) as EventDetails[]) : [];
    onUpdate(list);
  });

  return () => {
    off(userEvents.dbRef, "value", listener);
  };
}

/**
 * Safely migrates existing localStorage events into Firebase Realtime Database.
 * Runs once per browser session upon successful anonymous authentication.
 */
export async function syncLocalEventsToFirebase(localEvents: EventDetails[]): Promise<boolean> {
  if (typeof window === "undefined" || !localEvents || localEvents.length === 0) return false;

  const isMigrated = window.localStorage.getItem(MIGRATION_FLAG_KEY);
  if (isMigrated === "true") return true;

  try {
    const userEvents = await getUserEventsRef();
    if (!userEvents) return false;

    // Check if remote already has data
    const existingRemote = await fetchUserEventsFromFirebase();
    if (existingRemote && existingRemote.length > 0) {
      window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
      return true;
    }

    // Write each local event to Firebase
    for (const event of localEvents) {
      const eventRef = ref(getFirebaseDb()!, `users/${userEvents.uid}/events/${event.id}`);
      await set(eventRef, event);
    }

    window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
    console.log(`[Eventora Migration] Successfully synchronized ${localEvents.length} events to Firebase RTDB.`);
    return true;
  } catch (err) {
    console.warn("[Eventora Migration] Error during Firebase synchronization:", err);
    return false;
  }
}
