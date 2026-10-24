import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getFirebaseAuth } from "./config";

let currentUser: User | null = null;
let authPromise: Promise<User | null> | null = null;

/**
 * Ensures a valid Firebase Anonymous user session exists and returns the User object.
 */
export async function getOrCreateAnonymousUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  const auth = getFirebaseAuth();
  if (!auth) return null;

  if (currentUser) return currentUser;

  if (!authPromise) {
    authPromise = new Promise((resolve) => {
      // First check if already signed in
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUser = user;
          unsubscribe();
          resolve(user);
        } else {
          try {
            const credential = await signInAnonymously(auth);
            currentUser = credential.user;
            unsubscribe();
            resolve(credential.user);
          } catch (err) {
            console.warn("[Eventora Auth] Anonymous sign-in failed, falling back to local guest mode:", err);
            unsubscribe();
            resolve(null);
          }
        }
      });
    });
  }

  return authPromise;
}

/**
 * Synchronous accessor for currently signed in user UID (if available).
 */
export function getCurrentUserUid(): string | null {
  return currentUser?.uid || null;
}
