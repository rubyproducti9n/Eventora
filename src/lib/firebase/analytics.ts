import { getAnalytics, isSupported, Analytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { getFirebaseApp } from "./config";

let analyticsInstance: Analytics | null = null;
let isInitAttempted = false;

/**
 * Initializes Google Analytics for Firebase safely in client environments where supported.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  if (isInitAttempted) return null;

  isInitAttempted = true;
  try {
    const supported = await isSupported();
    if (supported) {
      const app = getFirebaseApp();
      if (app) {
        analyticsInstance = getAnalytics(app);
      }
    }
  } catch (err) {
    console.warn("[Eventora Analytics] Not supported or initialization failed:", err);
  }
  return analyticsInstance;
}

/**
 * Logs a privacy-safe, non-sensitive analytics event.
 * Never pass titles, notes, personal data, or budget details here.
 */
export async function trackAppEvent(
  eventName: "create_event" | "generate_plan" | "update_budget" | "complete_task" | "confirm_vendor" | "delete_event",
  params: Record<string, string | number | boolean> = {}
): Promise<void> {
  try {
    const analytics = await initAnalytics();
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    }
  } catch {
    // Fail silently in development/test environments
  }
}
