// frontend/src/app/(dashboard)/dashboard/components/shared/DashboardHeader.tsx
'use client';

import { Card } from '@/components/ui';

interface DashboardHeaderProps {
    userName?: string;
    subtitle: string;
    gradientFrom: string;
    gradientTo: string;
    icon: React.ReactNode;
    action?: React.ReactNode;
}

export function DashboardHeader({
    userName,
    subtitle,
    gradientFrom,
    gradientTo,
    icon,
    action
}: DashboardHeaderProps) {
    return (
        <Card className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white border-0`}>
            <Card.Body padding="lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">
                            Selamat Bekerja{userName ? `, ${userName}` : ''}!
                        </h2>
                        <p className="text-white/90">{subtitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {action}
                        <div className="w-16 h-16 opacity-50">{icon}</div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}