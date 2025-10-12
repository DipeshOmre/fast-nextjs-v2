import { User } from 'firebase/auth';

// Set Firebase ID token in cookies
export async function setAuthToken(user: User): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const token = await user.getIdToken();
      // Set token in httpOnly cookie via API call
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }
}

// Clear auth token from cookies
export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    fetch('/api/auth/clear-token', {
      method: 'POST',
    });
  }
}

// Get token from cookies (client-side)
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('firebase-token=')
    );
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  return null;
}
