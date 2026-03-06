
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push("/admin/dashboard");
      } else {
        router.push("/admin/login");
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <ShieldCheck className="h-16 w-16 text-secondary animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
        </div>
        <div>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter">KREATIONS 254</h1>
          <p className="text-secondary font-black uppercase text-[10px] tracking-[0.4em] mt-2">Checking Credentials...</p>
        </div>
      </div>
    </div>
  );
}
