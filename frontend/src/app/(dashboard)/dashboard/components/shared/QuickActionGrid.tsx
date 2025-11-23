// frontend/src/app/(dashboard)/dashboard/components/shared/QuickActionGrid.tsx
'use client';

import { useRouter } from 'next/navigation';

interface ActionItem {
    label: string;
    icon: React.ReactNode;
    route: string;
    hoverColor: string;
    bgColor: string;
}

interface QuickActionGridProps {
    actions: ActionItem[];
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => router.push(action.route)}
                    className={`p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-${action.hoverColor} hover:shadow-lg transition-all text-left group`}
                >
                    <div className={`w-6 h-6 ${action.bgColor} mb-2`}>
                        {action.icon}
                    </div>
                    <h3 className={`font-semibold text-gray-900 group-hover:text-${action.hoverColor}`}>
                        {action.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {action.label.includes('Rekam') ? 'Akses rekam medis pasien' :
                            action.label.includes('Jadwal') ? 'Lihat semua jadwal praktik' :
                                'Kelola data pasien Anda'}
                    </p>
                </button>
            ))}
        </div>
    );
}