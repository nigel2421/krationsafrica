import { initializeFirebase } from "@/firebase";

// Consolidate initialization to use the standard config and avoid "mock" errors.
const { auth, firestore: db, storage } = initializeFirebase();

export { auth, db, storage };
