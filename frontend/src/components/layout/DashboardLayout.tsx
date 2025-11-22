import React from 'react';
import Sidebar from '@/components/ui/layout/sidebar/Sidebar';
import Header from '@/components/ui/layout/header/Header';
import Footer from '@/components/ui/layout/footer/Footer';
import { cn } from '@/core';

export interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar sudah diperbaiki sebelumnya */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className={cn('flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth', className)}>
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <Footer className="flex-shrink-0" />
            </div>
        </div>
    );
}