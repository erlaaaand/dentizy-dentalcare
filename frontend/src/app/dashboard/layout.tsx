import type { Metadata } from 'next'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'

export const metadata: Metadata = {
    title: 'Dentizy Dentalcare - Dashboard',
    description: 'Dashboard untuk mengelola klinik gigi',
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <section className="flex-1 overflow-y-auto p-6">
                    {children}
                </section>

                {/* App Footer */}
                <footer className="bg-white border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-500">© 2025 Dentizy Dentalcare. All rights reserved.</p>
                            <span className="text-gray-300">|</span>
                            <p className="text-sm text-gray-500">Version 2.1.0</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* System Status */}
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-500">Sistem Online</span>
                            </div>

                            {/* Last Sync */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd" />
                                </svg>
                                <span>Terakhir disinkron: baru saja</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}