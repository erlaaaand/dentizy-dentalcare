'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Loading spinner component
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Memuat...</p>
    </div>
);

// Unauthorized component
const UnauthorizedPage = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Kembali ke Login
            </button>
        </div>
    </div>
);

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

export default function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<'loading' | 'verified' | 'unauthorized'>('loading');
    const [userRoles, setUserRoles] = useState<string[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Cek token di localStorage dan cookies
                const token = localStorage.getItem('access_token');
                const userStr = localStorage.getItem('user');

                if (!token) {
                    // Tidak ada token, redirect ke login
                    console.log('No token found, redirecting to login');
                    router.push('/login');
                    return;
                }

                // Jika ada token, ambil user info
                let user = null;
                if (userStr) {
                    try {
                        user = JSON.parse(userStr);
                        setUserRoles(user.roles || []);
                    } catch (e) {
                        console.error('Failed to parse user data:', e);
                    }
                }

                // Jika ada requiredRoles, cek apakah user punya role yang diperlukan
                if (requiredRoles && requiredRoles.length > 0) {
                    const hasRequiredRole = requiredRoles.some(role => 
                        user?.roles?.includes(role)
                    );

                    if (!hasRequiredRole) {
                        console.log('User does not have required roles');
                        setStatus('unauthorized');
                        return;
                    }
                }

                // Token valid dan role sesuai
                setStatus('verified');

            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/login');
            }
        };

        checkAuth();
    }, [router, pathname, requiredRoles]);

    // Show loading spinner
    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    // Show unauthorized page
    if (status === 'unauthorized') {
        return <UnauthorizedPage />;
    }

    // Show protected content
    return <>{children}</>;
}

// Export specific role guards
export function AdminGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRoles={['kepala_klinik']}>{children}</AuthGuard>;
}

export function DoctorGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRoles={['dokter', 'kepala_klinik']}>{children}</AuthGuard>;
}

export function StaffGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRoles={['staf', 'kepala_klinik']}>{children}</AuthGuard>;
}