import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Initialize Firebase Admin (Firestore) if credentials are available.
 *
 * Supports two configuration methods:
 *  1. FIREBASE_SERVICE_ACCOUNT_JSON - the full service account JSON as a
 *     single-line string env var (handy for hosts like Render/Railway
 *     where you can't easily upload a file).
 *  2. GOOGLE_APPLICATION_CREDENTIALS - path to a service account JSON
 *     file (standard Google Cloud convention).
 *
 * If neither is set, `db` is null and Firestore-backed features
 * (request logging) are skipped without crashing the app.
 */
function initFirebase(): Firestore | null {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (credentialsPath) {
      // applicationDefault() reads GOOGLE_APPLICATION_CREDENTIALS
      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn(
        "[firebase] No credentials found (FIREBASE_SERVICE_ACCOUNT_JSON or " +
          "GOOGLE_APPLICATION_CREDENTIALS). Firestore logging is disabled."
      );
      return null;
    }

    return getFirestore();
  } catch (err) {
    console.warn("[firebase] Failed to initialize:", (err as Error).message);
    return null;
  }
}

export const db: Firestore | null = initFirebase();
export const isFirebaseConfigured: boolean = db !== null;
