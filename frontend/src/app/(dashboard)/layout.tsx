// frontend/src/app/(dashboard)/layout.tsx
import type { Metadata } from 'next';
import Sidebar from '@/components/ui/layout/sidebar/Sidebar';
import { Header } from '@/components/ui/layout/header/';
import { Footer } from '@/components/ui/layout/footer/';
import { default as AuthGuard } from '@/components/guards/AuthGuard';

export const metadata: Metadata = {
  title: 'Dentizy Dentalcare - Dashboard',
  description: 'Dashboard untuk mengelola klinik gigi',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* AuthGuard membungkus seluruh layout dashboard.
       Jika user tidak login, mereka akan dilempar keluar sebelum melihat Sidebar/Header.
    */
    <AuthGuard>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Sidebar Statis di Kiri */}
        <Sidebar />

        {/* Area Konten Utama di Kanan */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          {/* Area Scrollable untuk Konten Halaman */}
          <section className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {/* HAPUS <Providers> DARI SINI.
               Context sudah disediakan oleh RootLayout.
            */}
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </AuthGuard>
  );
}