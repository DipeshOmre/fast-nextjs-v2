"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Automatically redirect to /app when the page loads
    router.replace('/app');
  }, [router]);

  return (<div>

  </div>); // Empty page - just redirects
}
