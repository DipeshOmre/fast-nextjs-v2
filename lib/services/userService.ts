"use client";

import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { FirestoreUser, UserDataInput, UserServiceResponse } from '@/lib/types/user';

/**
 * Firestore User Service
 * Handles saving and updating user information in Firestore
 */
export class UserService {
  private static readonly COLLECTION_NAME = 'users';

  /**
   * Save or update user information in Firestore
   * @param userData - User data from Firebase Auth
   * @returns Promise<UserServiceResponse>
   */
  static async saveUser(userData: UserDataInput): Promise<UserServiceResponse> {
    try {
      if (!userData.uid) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, this.COLLECTION_NAME, userData.uid);
      
      // Check if user already exists
      const userDoc = await getDoc(userRef);
      const now = new Date();

      if (userDoc.exists()) {
        // User exists - update lastLogin timestamp
        await setDoc(userRef, {
          lastLogin: now,
          updatedAt: now,
        }, { merge: true });

        console.log(`Updated lastLogin for user: ${userData.uid}`);
        
        // Return updated user data
        const updatedDoc = await getDoc(userRef);
        return {
          success: true,
          data: this.mapFirestoreDocToUser(updatedDoc.data() as any, userData.uid)
        };
      } else {
        // New user - create complete user document
        const newUserData: Omit<FirestoreUser, 'uid'> = {
          displayName: userData.displayName || null,
          email: userData.email || null,
          photoURL: userData.photoURL || null,
          lastLogin: now,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(userRef, newUserData);

        console.log(`Created new user document: ${userData.uid}`);
        
        return {
          success: true,
          data: {
            uid: userData.uid,
            ...newUserData
          }
        };
      }
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user data from Firestore
   * @param uid - User ID
   * @returns Promise<UserServiceResponse>
   */
  static async getUser(uid: string): Promise<UserServiceResponse> {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.mapFirestoreDocToUser(userDoc.data() as any, uid)
      };
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map Firestore document data to FirestoreUser interface
   * @param data - Firestore document data
   * @param uid - User ID
   * @returns FirestoreUser
   */
  private static mapFirestoreDocToUser(data: any, uid: string): FirestoreUser {
    return {
      uid,
      displayName: data.displayName || null,
      email: data.email || null,
      photoURL: data.photoURL || null,
      lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  }
}

/**
 * Convenience function to save user data
 * @param userData - User data from Firebase Auth
 * @returns Promise<UserServiceResponse>
 */
export const saveUserToFirestore = (userData: UserDataInput): Promise<UserServiceResponse> => {
  return UserService.saveUser(userData);
};

/**
 * Convenience function to get user data
 * @param uid - User ID
 * @returns Promise<UserServiceResponse>
 */
export const getUserFromFirestore = (uid: string): Promise<UserServiceResponse> => {
  return UserService.getUser(uid);
};
