"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/core/providers/AuthProvider";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { DashboardSkeleton } from "@/src/components/skeletons/dashboard-skeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // ⬇️ PENTING: jangan return null, tapi tunggu state stabil
  if (!user) {
    return <DashboardSkeleton />; // atau splash screen
  }

  return <>{children}</>;
}
