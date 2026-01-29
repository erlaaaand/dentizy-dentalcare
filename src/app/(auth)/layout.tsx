"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/core/providers/auth-provider";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { Skeleton } from "@/src/components/dashboard-ui/components/skeleton"; 
import { DashboardSkeleton } from "@/src/components/skeletons/dashboard-skeleton"; 

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      const currentPath = pathname || "";
      // Cegah redirect loop jika sudah di halaman login
      if (!currentPath.includes("/login")) {
         const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
         router.replace(loginUrl);
      }
    }
  }, [isMounted, isAuthenticated, isLoading, router, pathname]);

  if (!isMounted) return null;

  // --- LOGIKA SKELETON ---
  if (isLoading) {
    // Cek apakah user sedang mengakses Dashboard
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/appointments");

    if (isDashboard) {
      return <DashboardSkeleton />;
    }

    // Jika bukan dashboard (berarti Login/Register), tampilkan Card Skeleton
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-[400px] flex flex-col gap-6 p-6 border rounded-lg shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      </div>
    );
  }

  // Jika tidak loading tapi belum auth, return null (tunggu redirect)
  if (!isAuthenticated) return null;

  return <>{children}</>;
}