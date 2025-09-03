import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dentizy Dentalcare',
  description: 'Sistem Manajemen Klinik Gigi Modern',
  keywords: 'klinik gigi, dental care, manajemen pasien, janji temu',
  authors: [{ name: 'Dentizy Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <script src="/scripts/dashboard.js" defer />
      </head>
      <body className={inter.className}>
        {children}

        {/* Loading Overlay */}
        <div id="loading-overlay" className="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Memuat data...</span>
          </div>
        </div>
      </body>
    </html>
  )
}