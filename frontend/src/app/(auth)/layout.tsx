"use client";

import { useEffect, useState  } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/core/providers/auth-provider";
import { ROUTES } from "@/src/core/constants/routes.constants";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}