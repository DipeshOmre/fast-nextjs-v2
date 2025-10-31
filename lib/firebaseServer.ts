// lib/firebaseServer.ts
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Prefer server-side env vars, but fall back to NEXT_PUBLIC_* values if not set
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Fail fast with a clear message if projectId is missing — this commonly causes
// low-level Firestore gRPC errors like "INVALID_ARGUMENT: Invalid resource field value".
if (!firebaseConfig.projectId) {
  throw new Error(
    'FIREBASE_PROJECT_ID is not set. Set FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID in your environment.'
  );
}

// Initialize app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore db
export const db = getFirestore(app);
