import React from "react";
import Authentication from "@/app/_components/Authentication";

const LoginPage = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1>Login</h1>
      <Authentication />
    </div>
  );
};

export default LoginPage;
