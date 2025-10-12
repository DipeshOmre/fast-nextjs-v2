"use client";

import React from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';

/**
 * Example component demonstrating how to use the user saving functionality
 */
export function UserManagementExample() {
  const { user, saveCurrentUserToFirestore, loading } = useAuthContext();

  const handleSaveUser = async () => {
    try {
      await saveCurrentUserToFirestore();
      alert('User data saved successfully!');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user data');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to manage your data</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">User Management</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
        <p><strong>Email:</strong> {user.email || 'Not set'}</p>
        <p><strong>Photo URL:</strong> {user.photoURL || 'Not set'}</p>
      </div>

      <Button 
        onClick={handleSaveUser}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save User Data to Firestore'}
      </Button>
    </div>
  );
}
