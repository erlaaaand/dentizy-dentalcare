// frontend/src/features/dashboard/components/widgets/QuickActions.tsx

import Link from 'next/link';
import { Card } from '@/components/ui';
import { QuickAction } from '../../types/dashboard.types';
import { ArrowRight } from 'lucide-react';

interface QuickActionsProps {
    actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
    return (
        <Card>
            <Card.Header divider>
                <Card.Title>Aksi Cepat</Card.Title>
                <Card.Description>Menu yang sering digunakan</Card.Description>
            </Card.Header>

            <Card.Body padding="md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actions.map((action) => (
                        <Link
                            key={action.id}
                            href={action.href}
                            className="group relative p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    {action.icon}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                    {action.label}
                                </span>
                            </div>

                            {/* Hover effect arrow */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}