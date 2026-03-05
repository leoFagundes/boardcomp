"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/loading";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-coal-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">{children}</main>
    </div>
  );
}
