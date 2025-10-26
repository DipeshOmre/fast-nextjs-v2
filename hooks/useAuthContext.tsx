"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { setAuthToken, clearAuthToken } from '@/lib/tokenManager';
import { saveUserToFirestore } from '@/lib/services/userService';
import { UserDataInput } from '@/lib/types/user';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  saveCurrentUserToFirestore: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to save user data to Firestore
  const saveUserData = async (user: User) => {
    try {
      const userData: UserDataInput = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        credits:20
      };

      const result = await saveUserToFirestore(userData);
      
      if (result.success) {
        console.log('User data saved successfully:', result.data);
      } else {
        console.error('Failed to save user data:', result.error);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      // Handle token management and user data saving asynchronously
      if (user) {
        // Don't await these to prevent blocking the auth state change
        setAuthToken(user).catch(console.error);
        saveUserData(user).catch(console.error);
      } else {
        clearAuthToken();
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      
      // Check if Firebase is properly configured
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log('Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      
      // The onAuthStateChanged will handle setting loading to false
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setLoading(false); // Make sure to reset loading state on error
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged will handle setting loading to false
    } catch (error) {
      console.error('Email sign-in error:', error);
      setLoading(false); // Make sure to reset loading state on error
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      // The onAuthStateChanged will handle setting loading to false
    } catch (error) {
      console.error('Email sign-up error:', error);
      setLoading(false); // Make sure to reset loading state on error
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      if (user) {
        await updateProfile(user, data);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const saveCurrentUserToFirestore = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    await saveUserData(user);
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    resetPassword,
    updateUserProfile,
    saveCurrentUserToFirestore,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Export the context for advanced usage
export { AuthContext };
