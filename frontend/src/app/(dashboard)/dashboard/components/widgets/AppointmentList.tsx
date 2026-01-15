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
        <Card className="h-full flex flex-col w-full shadow-sm border border-gray-200">
            <Card.Header divider className="py-4 px-6 bg-white">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <Card.Title className="text-base font-semibold text-gray-800">{title}</Card.Title>
                        <Card.Description className="text-xs text-gray-500">Daftar pasien yang dijadwalkan</Card.Description>
                    </div>
                    <Link
                        href={ROUTES.APPOINTMENTS}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all px-2 py-1 rounded hover:bg-blue-50"
                    >
                        Lihat Semua
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </Card.Header>

            <Card.Body padding="none" className="flex-1 overflow-y-auto min-h-[300px]">
                {loading ? (
                    <div className="p-6 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                        <EmptyState
                            icon={<Clock className="w-12 h-12 text-gray-300 mb-3" />}
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
                                className="block p-4 hover:bg-blue-50/50 transition-colors group relative"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Time Badge */}
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                        <span className="text-xs font-bold uppercase">Jam</span>
                                        <span className="text-lg font-bold tracking-tight">{apt.time}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                {apt.patientName}
                                            </h4>
                                            <StatusIndicator
                                                status={apt.status as any}
                                                size="sm"
                                                variant="badge"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Pasien Umum</span>
                                            </div>
                                            {apt.complaint && (
                                                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    <span className="truncate" title={apt.complaint}>
                                                        {apt.complaint}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow Action */}
                                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                        <ArrowRight className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}