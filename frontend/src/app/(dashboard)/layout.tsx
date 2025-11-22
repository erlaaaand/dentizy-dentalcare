import type { Metadata } from 'next'
import Sidebar from '@/components/ui/layout/sidebar/Sidebar'
import Header from '@/components/ui/layout/header/'
import Footer from '@/components/ui/layout/footer'
import AuthGuard from '@/components/providers/AuthProvider';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
    title: 'Dentizy Dentalcare - Dashboard',
    description: 'Dashboard untuk mengelola klinik gigi',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div id="app-container" className="flex h-screen bg-gray-100">
        <Sidebar />
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
          <Header />
          {/* Di sini HANYA ada {children} sebagai placeholder untuk konten halaman */}
          <section className="flex-1 overflow-y-auto p-6">
            <Providers>
            {children}
            </Providers>
          </section>
          <Footer />
        </main>
      </div>
    </AuthGuard>
  );
}