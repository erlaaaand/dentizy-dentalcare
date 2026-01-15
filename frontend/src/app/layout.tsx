// frontend/src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { cn } from '@/core';

// Global Styles
import './globals.css';
// Pastikan path ini sesuai dengan struktur folder Anda (misal: src/styles/animations.css)
import '../styles/animations.css';

// Font Configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: untuk penggunaan CSS variable
  display: 'swap',
});

// Viewport Configuration (Terpisah di Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff', // Sesuaikan dengan brand color
};

// Metadata Configuration
export const metadata: Metadata = {
  title: {
    default: 'Dentizy Dentalcare',
    template: '%s | Dentizy Dentalcare', // Halaman lain akan menjadi "Nama Halaman | Dentizy..."
  },
  description: 'Sistem Manajemen Klinik Gigi Modern',
  icons: {
    icon: '/favicon.ico', // Pastikan file ini ada di folder public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          'min-h-screen bg-gray-50 antialiased', // Styling dasar untuk body
          'selection:bg-blue-100 selection:text-blue-900' // Optional: Custom text selection color
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}