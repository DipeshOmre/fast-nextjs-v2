"use client"

import { useAuthContext } from "@/hooks/useAuthContext";
import axios from "axios";
import React, { useEffect } from "react";

/**
 * Safe stringify for Error-like objects (includes non-enumerable props)
 */
function safeErrorString(err: any) {
  try {
    // include non-enumerable Error props like message, stack, name
    const plain: Record<string, any> = {};
    Object.getOwnPropertyNames(err).forEach((k) => {
      try {
        plain[k] = (err as any)[k];
      } catch {
        plain[k] = "[unserializable]";
      }
    });
    // also include common nested axios response fields if present
    if (err?.response) {
      plain.response = {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers,
      };
    }
    return JSON.stringify(plain);
  } catch {
    // fallback
    return String(err);
  }
}

function Provider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();

  async function createNewUser() {
    try {
      if (!user) return;

      const payload = {
        firebaseId: user.uid,
        name: user.displayName || user.email?.split('@')[0] || "User",
        email: user.email || null,
      };

      if (!payload.firebaseId || !payload.email) {
        console.warn("createNewUser: missing required fields, skipping API call", payload);
        return;
      }

      const res = await axios.post("/api/user", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      // normal logging — primitives only
      console.log("createNewUser success:", res.status, res.data);
      return res.data;
    } catch (err: any) {
      // Safer: build a small primitive summary, or use safeErrorString
      const summary = {
        message: err?.message || "unknown",
        code: err?.code || null,
        status: err?.response?.status || null,
      };

      // Use console.warn/log (less likely to trigger Next overlay) and pass primitives
      console.warn("createNewUser failed:", summary);

      // If you still want full dump for debugging, stringify safely and log as single string
      console.debug("createNewUser - full error:", safeErrorString(err));

      // Do not rethrow unless you want an error overlay
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;
    if (user && mounted) {
      // call but don't block render; errors handled inside createNewUser
      createNewUser();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  return <div>{children}</div>;
}

export default Provider;

// "use client"

// import { useUser } from '@clerk/nextjs';
// import axios from 'axios';
// import React, { useContext, useEffect, useState } from 'react'


// function Provider({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {

//     const { user } = useUser();
//     useEffect(() => {
//         user && createNewUser();
//     }, [user]);

//     const createNewUser = async () => {
//         const result = await axios.post('/api/user');
//     }

//     return (
//         <div>
//             {children}
//         </div>
//     )
// }



// export default Provider


