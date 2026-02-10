import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Login | Dentizy Dental Care',
  description: 'Masuk ke sistem manajemen klinik Dentizy',
};

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Decorator (Opsional) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#e2e8f0_0%,#ffffff_100%)]" />
      
      <div className="relative flex min-h-screen flex-col">
        {children}
      </div>
      
      {/* Footer Sederhana */}
      <footer className="absolute bottom-4 w-full text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Dentizy Dental Care. All rights reserved.
      </footer>
    </main>
  );
}