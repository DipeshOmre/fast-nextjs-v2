// "use client";
// import { useState } from "react";
// import { auth } from "@/lib/firebaseClient";
// import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
// import Image from "next/image";

// function Authentication() {
//   const [user, setUser] = useState<User | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const provider = new GoogleAuthProvider();

//   const handleLogin = async () => {
//     setError(null);
//     try {
//       const result = await signInWithPopup(auth, provider);
//       setUser(result.user);
//     } catch (err: any) {
//       setError(err.message || "Login failed");
//       setUser(null);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//       setUser(null);
//     } catch (err: any) {
//       setError(err.message || "Logout failed");
//     }
//   };

//   return (
//     <div>
//       {user ? (
//         <div className="flex flex-col items-center">
            
//           <img
//             // src={user.photoURL || './prof.jpg'}
//             src={'/prof.jpg'}

//             alt="User Avatar"
//             className="w-16 h-16 rounded-full mb-3 border-2 border-indigo-200"
//           />
//           <p className="text-lg font-semibold mb-2">
//             Welcome, {user.displayName || user.email}!
//           </p>
//           <button
//             onClick={handleLogout}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
//           >
//             Logout
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={handleLogin}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
//         >
//           <svg className="w-5 h-5" viewBox="0 0 48 48">
//             <g>
//               <path
//                 fill="#4285F4"
//                 d="M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"
//               />
//               <path
//                 fill="#34A853"
//                 d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"
//               />
//               <path
//                 fill="#FBBC05"
//                 d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.9 27 38 24 38c-5.6 0-10.3-3.8-12-9H5.8v5.7C9.2 41.6 16.1 45 24 45z"
//               />
//               <path
//                 fill="#EA4335"
//                 d="M44.5 20H24v8.5h11.7c-1.1 3.1-3.6 5.5-6.7 6.7l6.5 5.3C41.7 37.1 45 31.1 45 24c0-1.4-.1-2.7-.3-4z"
//               />
//             </g>
//           </svg>
//           Login with Google
//         </button>
//       )}
//       {error && (
//         <p className="mt-4 text-red-500 text-sm">{error}</p>
//       )}
//     </div>
//   );
// }

// export default Authentication;




"use client";
import React, { useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import Image from "next/image";

function Authentication() {
  const { user, signInWithGoogle, logout } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
    } catch (err: any) {
      setError(err.message || "Logout failed");
    }
  };

  return (
    // <div>
    //   {user ? (
    //     <div className="flex flex-col items-center">
    //       <img
    //         src={user.photoURL || "/prof.jpg"}
    //         alt="User Avatar"
    //         className="w-16 h-16 rounded-full mb-3 border-2 border-indigo-200"
    //       />
    //       <p className="text-lg font-semibold mb-2">
    //         Welcome, {user.displayName || user.email}
    //       </p>
    //       <button
    //         onClick={handleLogout}
    //         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    //       >
    //         Logout
    //       </button>
    //     </div>
    //   ) : (
    //     <button
    //       onClick={handleLogin}
    //       className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
    //     >
    //       <svg className="w-5 h-5" viewBox="0 0 48 48">
    //         <g>
    //           <path
    //             fill="#4285F4"
    //             d="M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"
    //           />
    //           <path
    //             fill="#34A853"
    //             d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"
    //           />
    //           <path
    //             fill="#FBBC05"
    //             d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.9 27 38 24 38c-5.6 0-10.3-3.8-12-9H5.8v5.7C9.2 41.6 16.1 45 24 45z"
    //           />
    //           <path
    //             fill="#EA4335"
    //             d="M44.5 20H24v8.5h11.7c-1.1 3.1-3.6 5.5-6.7 6.7l6.5 5.3C41.7 37.1 45 31.1 45 24c0-1.4-.1-2.7-.3-4z"
    //           />
    //         </g>
    //       </svg>
    //       Login with Google
    //     </button>
    //   )}
    //   {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    // </div>

<div className="min-h-[240px] flex items-center justify-center p-6">
<div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
  {user ? (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Avatar */}
      <div className="relative">
        <img
          src={"/prof.jpg"}
          alt={user.displayName ? `${user.displayName} avatar` : "User avatar"}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-sm"
          loading="lazy"
          decoding="async"
        />
        {/* online ring */}
        <span
          className="absolute right-0 bottom-0 block w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-2 ring-white dark:ring-slate-900"
          aria-hidden="true"
          style={{ backgroundColor: "#34D399" }}
        />
      </div>

      {/* Welcome text */}
      <div>
        <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
          Welcome,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            {user.displayName || user.email}
          </span>
        </p>
        {/* optional small email line */}
        {user.email && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user.email}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 text-white rounded-md transition"
          aria-label="Logout"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          Logout
        </button>

        <button
          onClick={() => window.location.href = "/profile"}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-100 text-sm transition"
          aria-label="Open profile"
          type="button"
        >
          Profile
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100">
        {/* Google icon */}
        <svg className="w-10 h-10" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <g>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.9 27 38 24 38c-5.6 0-10.3-3.8-12-9H5.8v5.7C9.2 41.6 16.1 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-3.6 5.5-6.7 6.7l6.5 5.3C41.7 37.1 45 31.1 45 24c0-1.4-.1-2.7-.3-4z"/>
          </g>
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign in to continue</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Access your dashboard and AI tools — quick login with Google.
      </p>

      <button
        onClick={handleLogin}
        className="mt-2 flex items-center gap-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
        aria-label="Login with Google"
        type="button"
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
          <g>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.9 27 38 24 38c-5.6 0-10.3-3.8-12-9H5.8v5.7C9.2 41.6 16.1 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-3.6 5.5-6.7 6.7l6.5 5.3C41.7 37.1 45 31.1 45 24c0-1.4-.1-2.7-.3-4z"/>
          </g>
        </svg>
        Login with Google
      </button>

      {/** small helper link to alternative login */}
      <button
        onClick={() => window.location.href = "/auth/email"}
        className="mt-1 text-xs text-slate-500 hover:underline"
        type="button"
      >
        Sign in with email instead
      </button>
    </div>
  )}

  {/* Error message */}
  {error && (
    <div className="mt-4 px-3 py-2 rounded-md bg-red-50 border border-red-100 text-red-700 text-sm">
      <strong className="sr-only">Error:</strong>
      <span>{error}</span>
    </div>
  )}
</div>
</div>

  );
}

export default Authentication;

