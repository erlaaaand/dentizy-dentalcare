import type { Metadata } from "next";
import QueryProvider from "@/src/core/providers/query-provider";
import { AuthProvider } from "@/src/core/providers/auth-provider";
import { Toaster } from "@/src/components/dashboard-ui/components/sonner"; // Pastikan path ini benar
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard Page",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster /> {/* Komponen Toast Sonner */}
        </AuthProvider>
      </QueryProvider>
  );
}