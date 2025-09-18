'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Komponen loading sederhana
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'verified' | 'unverified'>('loading');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Jika tidak ada token, paksa ke halaman login
            router.push('/login');
        } else {
            // Jika ada token, izinkan konten untuk ditampilkan
            setStatus('verified');
        }
    }, [router]);

    // Tampilkan konten hanya jika sudah terverifikasi
    if (status !== 'verified') {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}