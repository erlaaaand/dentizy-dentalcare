// frontend/src/app/(auth)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentication - Dentizy Dentalcare',
    description: 'Login to access Dentizy Dentalcare system',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {children}
        </div>
    );
}
