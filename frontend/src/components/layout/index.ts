// ============================================
// Sidebar.tsx - Re-export dari dashboard/sidebar
// ============================================
export { default as Sidebar } from '@/components/dashboard/sidebar';

// ============================================
// Header.tsx - Re-export dari dashboard/header
// ============================================
export { default as Header } from '@/components/dashboard/header';

// ============================================
// Footer.tsx - Re-export dari dashboard/footer
// ============================================
export { default as Footer } from '@/components/dashboard/footer';

// ============================================
// Alternative: Create Simple Wrappers
// ============================================

/**
 * File ini berfungsi sebagai re-export dari komponen dashboard
 * yang sudah ada, sehingga bisa digunakan di layout components
 * tanpa perlu import path yang panjang.
 * 
 * Usage:
 * import { Sidebar, Header, Footer } from '@/components/layout';
 * 
 * Atau tetap bisa menggunakan import langsung:
 * import Sidebar from '@/components/dashboard/sidebar';
 */