// frontend/src/features/dashboard/components/widgets/WelcomeBanner.tsx

import { Card, Skeleton } from '@/components/ui';
import { formatDate } from '@/core/utils/date/date.utils';
import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
    userName: string;
    subtitle?: string;
    loading?: boolean;
}

export function WelcomeBanner({ userName, subtitle, loading }: WelcomeBannerProps) {
    if (loading) {
        return (
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700">
                <Card.Body padding="lg">
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-64 bg-white/20" />
                        <Skeleton className="h-5 w-96 bg-white/20" />
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl border-0 overflow-hidden relative">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

            <Card.Body padding="lg" className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                Selamat Datang, {userName}!
                            </h1>
                        </div>
                        <p className="text-blue-100 text-base">
                            {subtitle || `${formatDate(new Date())} - Semangat melayani hari ini!`}
                        </p>
                    </div>

                    {/* Optional: Add an illustration or icon */}
                    <div className="hidden md:block">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}