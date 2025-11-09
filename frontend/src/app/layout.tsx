import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/animations.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dentizy Dentalcare',
  description: 'Sistem Manajemen Klinik Gigi Modern',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* Tidak ada tag <head> atau <script> manual di sini. 
        Next.js akan menangani metadata dan skrip secara otomatis.
        File ini harus sesederhana mungkin.
      */}
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers> {/* Cukup render children di sini */}
      </body>
    </html>
  );
}

