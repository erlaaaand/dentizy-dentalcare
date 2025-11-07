import React from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import Footer from '@/components/dashboard/footer';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className={cn('flex-1 overflow-y-auto p-6', className)}>
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}