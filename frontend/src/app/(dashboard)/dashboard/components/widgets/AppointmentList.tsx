// frontend/src/features/dashboard/components/widgets/AppointmentList.tsx

import Link from 'next/link';
import { Card, Skeleton, EmptyState, StatusIndicator } from '@/components/ui';
import { ROUTES } from '@/core/constants';
import { Clock, User, ArrowRight } from 'lucide-react';
import { AppointmentListItem } from '../../types/dashboard.types';

interface AppointmentListProps {
    appointments: AppointmentListItem[];
    loading?: boolean;
    title?: string;
    emptyMessage?: string;
}

export function AppointmentList({
    appointments,
    loading,
    title = "Jadwal Hari Ini",
    emptyMessage = "Belum ada janji temu hari ini"
}: AppointmentListProps) {
    return (
        <Card className="h-full flex flex-col">
            <Card.Header divider>
                <div className="flex items-center justify-between w-full">
                    <div>
                        <Card.Title>{title}</Card.Title>
                        <Card.Description>Daftar pasien yang dijadwalkan</Card.Description>
                    </div>
                    <Link
                        href={ROUTES.APPOINTMENTS}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Lihat Semua
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </Card.Header>

            <Card.Body padding="none" className="flex-1">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border-b">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="py-12">
                        <EmptyState
                            icon={
                                <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                            title="Tidak Ada Jadwal"
                            description={emptyMessage}
                            size="sm"
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {appointments.map((apt) => (
                            <Link
                                key={apt.id}
                                href={`${ROUTES.APPOINTMENTS}/${apt.id}`}
                                className="block p-4 hover:bg-blue-50 transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-blue-600">
                                                {apt.time}
                                            </span>
                                            <StatusIndicator
                                                status={apt.status as any}
                                                size="sm"
                                                variant="badge"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {apt.patientName}
                                            </h4>
                                        </div>
                                        {apt.complaint && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {apt.complaint}
                                            </p>
                                        )}
                                    </div>

                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}