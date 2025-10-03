"use client"
import Image from "next/image";

import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const router =useRouter();
  const { user } = useUser();
  useEffect(() => {
    router.replace('/app')
  }, [])
  
  return (
    <div>
      

    </div>
  );
}
