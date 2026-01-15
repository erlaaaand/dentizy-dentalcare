'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/core';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === '/auth/login';
    const isRegisterPage = pathname === '/auth/register';

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className={cn(
                "w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden",
                "border border-gray-100 transition-all duration-300 hover:shadow-2xl"
            )}>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full" />
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dentizy</h1>
                        <p className="text-sm text-gray-500 mt-2">Sistem Informasi Klinik Gigi</p>
                    </div>
                    <div className="space-y-6">{children}</div>
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        {isLoginPage && (
                            <p className="text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Daftar sekarang
                                </Link>
                            </p>
                        )}
                        {isRegisterPage && (
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Login
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;