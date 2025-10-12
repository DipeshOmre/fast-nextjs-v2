"use client";
import React from "react";
import Authentication from "@/app/_components/Authentication";
import { useAuthContext } from "@/hooks/useAuthContext";

const LoginPage = () => {
  const { user } = useAuthContext();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      {user?<h1>Welcome to AI Ads Generator Platform</h1>:<h1>Login with Google</h1>}
      <Authentication />
    </div>
  );
};

export default LoginPage;
