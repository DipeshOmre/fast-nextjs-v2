"use client";
import { useState } from "react";
import { auth } from "@/configs/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import Image from "next/image";

function Authentication() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    }
  };

  return (
    <div>
      {user ? (
        <div className="flex flex-col items-center">
            
          <img
            // src={user.photoURL || './prof.jpg'}
            src={'/prof.jpg'}

            alt="User Avatar"
            className="w-16 h-16 rounded-full mb-3 border-2 border-indigo-200"
          />
          <p className="text-lg font-semibold mb-2">
            Welcome, {user.displayName || user.email}!
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"
              />
              <path
                fill="#FBBC05"
                d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.9 27 38 24 38c-5.6 0-10.3-3.8-12-9H5.8v5.7C9.2 41.6 16.1 45 24 45z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.7c-1.1 3.1-3.6 5.5-6.7 6.7l6.5 5.3C41.7 37.1 45 31.1 45 24c0-1.4-.1-2.7-.3-4z"
              />
            </g>
          </svg>
          Login with Google
        </button>
      )}
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}

export default Authentication;
