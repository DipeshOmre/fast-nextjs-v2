// Server-side only Firebase Admin utilities
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Ensure this module only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('firebaseAdmin.ts should only be imported on the server side');
}

// Initialize Firebase Admin SDK (server-side only)
let adminAuth: any = null;

function initializeFirebaseAdmin() {
  if (!adminAuth && getApps().length === 0) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      adminAuth = getAuth();
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
  return adminAuth;
}

// Verify Firebase ID token (server-side only)
export async function verifyFirebaseToken(token: string) {
  try {
    const auth = initializeFirebaseAdmin();
    if (!auth) {
      console.error('Firebase Admin not initialized');
      return null;
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}
