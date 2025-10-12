// TypeScript interfaces for user data

export interface FirestoreUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDataInput {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface UserServiceResponse {
  success: boolean;
  data?: FirestoreUser;
  error?: string;
}
