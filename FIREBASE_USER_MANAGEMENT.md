# Firebase User Data Management

This implementation provides a complete solution for saving user information to Firebase Firestore after successful authentication.

## 📁 File Structure

```
lib/
├── types/
│   └── user.ts                 # TypeScript interfaces
├── services/
│   └── userService.ts          # Firestore user service
└── firebaseClient.ts           # Firebase client configuration

hooks/
└── useAuthContext.tsx          # Updated auth context with user saving

components/examples/
└── UserManagementExample.tsx   # Example usage component
```

## 🔧 Implementation Details

### 1. TypeScript Interfaces (`lib/types/user.ts`)

```typescript
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
```

### 2. Firestore User Service (`lib/services/userService.ts`)

The `UserService` class provides:
- **`saveUser()`**: Saves or updates user data in Firestore
- **`getUser()`**: Retrieves user data from Firestore
- **Automatic handling**: Creates new users or updates existing ones
- **Timestamp management**: Tracks `lastLogin`, `createdAt`, and `updatedAt`

### 3. Updated Auth Context (`hooks/useAuthContext.tsx`)

The auth context now includes:
- **Automatic user saving**: Saves user data on every login
- **Manual save function**: `saveCurrentUserToFirestore()` for explicit saves
- **Non-blocking**: User saving doesn't block the authentication flow

## 🚀 How It Works

### Automatic User Saving

When a user logs in (Google or email/password), the system automatically:

1. **Detects authentication** via `onAuthStateChanged`
2. **Extracts user data** (uid, displayName, email, photoURL)
3. **Saves to Firestore** in the `users` collection
4. **Updates timestamps** for existing users or creates new ones

### Firestore Collection Structure

```javascript
// Collection: users
// Document ID: {user.uid}
{
  uid: "firebase-user-id",
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://example.com/photo.jpg",
  lastLogin: Timestamp,
  createdAt: Timestamp,  // Only for new users
  updatedAt: Timestamp   // Updated on each save
}
```

## 📖 Usage Examples

### 1. Automatic Saving (Already Implemented)

The user data is automatically saved when users log in. No additional code needed!

### 2. Manual Saving

```typescript
import { useAuthContext } from '@/hooks/useAuthContext';

function MyComponent() {
  const { saveCurrentUserToFirestore, user } = useAuthContext();

  const handleSaveUser = async () => {
    try {
      await saveCurrentUserToFirestore();
      console.log('User data saved!');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <button onClick={handleSaveUser}>
      Save User Data
    </button>
  );
}
```

### 3. Direct Service Usage

```typescript
import { saveUserToFirestore, getUserFromFirestore } from '@/lib/services/userService';

// Save user data
const result = await saveUserToFirestore({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
});

// Get user data
const userData = await getUserFromFirestore(user.uid);
```

## 🔄 Login Flow Integration

The user saving is integrated into your existing login flow:

1. **User clicks "Sign In"** → Redirected to `/sign-in`
2. **User authenticates** → Google or email/password
3. **Firebase Auth triggers** → `onAuthStateChanged` fires
4. **User data saved** → Automatically saved to Firestore
5. **User redirected** → To `/app` dashboard

## 🛠️ Configuration

### Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firestore Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing

### Test the Implementation

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Sign in with Google** or email/password

3. **Check the browser console** for success messages:
   ```
   User data saved successfully: {user data}
   ```

4. **Check Firestore** in the Firebase Console:
   - Go to Firestore Database
   - Look for the `users` collection
   - Verify user documents are created/updated

### Example Test Component

Add this to any page to test manually:

```typescript
import { UserManagementExample } from '@/components/examples/UserManagementExample';

export default function TestPage() {
  return (
    <div>
      <h1>User Management Test</h1>
      <UserManagementExample />
    </div>
  );
}
```

## 🎯 Key Features

✅ **Automatic saving** on every login  
✅ **TypeScript support** with full type safety  
✅ **Error handling** with detailed logging  
✅ **Non-blocking** - doesn't slow down authentication  
✅ **Reusable** - can be used anywhere in your app  
✅ **Firestore optimized** - efficient reads/writes  
✅ **Timestamp tracking** - knows when users last logged in  

## 🔍 Troubleshooting

### Common Issues

1. **"User data not saving"**
   - Check browser console for errors
   - Verify Firestore rules allow writes
   - Ensure Firebase project is properly configured

2. **"TypeScript errors"**
   - Make sure all imports are correct
   - Check that Firebase is properly initialized

3. **"Permission denied"**
   - Update Firestore security rules
   - Ensure user is authenticated

### Debug Mode

Enable detailed logging by checking the browser console. The service logs:
- Successful saves
- Error messages
- User data being saved

## 🚀 Next Steps

1. **Test the implementation** with your authentication flow
2. **Customize the user data** fields as needed
3. **Add additional user management** features
4. **Implement user analytics** using the saved data

The implementation is production-ready and follows Firebase best practices! 🎉
