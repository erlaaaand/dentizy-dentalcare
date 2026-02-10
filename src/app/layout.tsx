import QueryProvider from "@/src/core/providers/query-provider";
import { AuthProvider } from "@/src/core/providers/AuthProvider";
import { Toaster } from "@/src/components/dashboard-ui/components/sonner"; 
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}