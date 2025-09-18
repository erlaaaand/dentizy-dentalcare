import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fungsi middleware utama
export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookie
  const token = request.cookies.get('access_token')?.value;

  // 2. Tentukan URL tujuan
  const { pathname } = request.nextUrl;

  // 3. Logika pengalihan
  // Jika tidak ada token DAN pengguna mencoba mengakses area dasbor
  if (!token && pathname.startsWith('/dashboard')) {
    // Arahkan mereka ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Jika ada token DAN pengguna mencoba mengakses halaman login
  if (token && pathname === '/login') {
    // Arahkan mereka ke dasbor karena sudah login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika tidak ada kondisi di atas, lanjutkan seperti biasa
  return NextResponse.next();
}

// Konfigurasi: Tentukan path mana saja yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path, KECUALI:
     * - /api (rute API)
     * - /_next/static (file statis Next.js)
     * - /_next/image (optimasi gambar)
     * - /favicon.ico (file ikon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};