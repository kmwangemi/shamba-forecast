import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const COLLECTION = "recentSearches";
const MAX_RESULTS = 5;

export interface RecentSearch {
  id: string;
  town: string;
  searchedAt: Timestamp | null;
}

/**
 * Record a search in Firestore. No-ops silently if Firebase isn't
 * configured, so this never blocks the main forecast flow.
 */
export async function recordSearch(town: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  try {
    await addDoc(collection(db, COLLECTION), {
      town,
      searchedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[firestore] failed to record search:", err);
  }
}

/**
 * Fetch the most recent searches, newest first. Returns an empty array
 * if Firebase isn't configured or the read fails.
 */
export async function getRecentSearches(): Promise<RecentSearch[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("searchedAt", "desc"),
      limit(MAX_RESULTS)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      town: doc.data().town as string,
      searchedAt: (doc.data().searchedAt as Timestamp) ?? null,
    }));
  } catch (err) {
    console.warn("[firestore] failed to fetch recent searches:", err);
    return [];
  }
}
