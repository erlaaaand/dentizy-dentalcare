'use client';

import React from 'react';
import { Appointment, AppointmentStatus } from '@/core/types/api';
import { useToastStore } from '@/stores/toastStore';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { appointmentService } from '@/lib/api';
import { formatDate, formatTime } from '@/core/formatters';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { AppointmentCard } from './AppointmentCard';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import {
    Calendar as CalendarIcon,
    Edit,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    Trash2,
} from 'lucide-react';

interface AppointmentListProps {
    appointments: Appointment[];
    loading?: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onEdit?: (appointment: Appointment) => void;
    onView?: (appointment: Appointment) => void;
    onCreateMedicalRecord?: (appointment: Appointment) => void;
    viewMode?: 'table' | 'card';
}

export function AppointmentList({
    appointments,
    loading = false,
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    onEdit,
    onView,
    onCreateMedicalRecord,
    viewMode = 'table',
}: AppointmentListProps) {
    const { success, error: showError } = useToastStore();
    const { confirmDelete } = useConfirm();

    const handleDelete = async (appointment: Appointment) => {
        await confirmDelete(
            `janji temu untuk ${appointment.patient.nama_lengkap}`,
            async () => {
                try {
                    await appointmentService.delete(appointment.id);
                    success('Janji temu berhasil dihapus');
                    window.location.reload();
                } catch (err: any) {
                    showError(err.message || 'Gagal menghapus janji temu');
                }
            }
        );
    };

    const handleStatusChange = async (
        appointment: Appointment,
        newStatus: AppointmentStatus
    ) => {
        try {
            await appointmentService.updateStatus(appointment.id, newStatus);
            success('Status berhasil diperbarui');
            window.location.reload();
        } catch (err: any) {
            showError(err.message || 'Gagal memperbarui status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!appointments || appointments.length === 0) {
        return (
            <EmptyState
                icon={<CalendarIcon className="w-12 h-12 text-gray-400" />}
                title="Belum ada janji temu"
                description="Janji temu yang dibuat akan muncul di sini"
            />
        );
    }

    // Card View
    if (viewMode === 'card') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {appointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onClick={() => onView?.(appointment)}
                            actions={
                                <>
                                    {onView && (
                                        <Button variant="ghost" size="sm" onClick={() => onView(appointment)}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Lihat
                                        </Button>
                                    )}

                                    {appointment.status === AppointmentStatus.DIJADWALKAN && (
                                        <>
                                            {onCreateMedicalRecord && !appointment.medical_record && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => onCreateMedicalRecord(appointment)}
                                                >
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Buat Rekam Medis
                                                </Button>
                                            )}

                                            {onEdit && (
                                                <Button variant="ghost" size="sm" onClick={() => onEdit(appointment)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(appointment, AppointmentStatus.SELESAI)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Selesai
                                            </Button>

                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(appointment)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Hapus
                                            </Button>
                                        </>
                                    )}
                                </>
                            }
                        />
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        showInfo
                        startIndex={(currentPage - 1) * 10}
                        endIndex={Math.min(currentPage * 10, totalItems)}
                        totalItems={totalItems}
                    />
                )}
            </div>
        );
    }

    // Table View
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal & Waktu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pasien
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dokter
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Keluhan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {formatDate(appointment.tanggal_janji, 'dd MMM yyyy')}
                                            </div>
                                            <div className="text-gray-500">{formatTime(appointment.jam_janji)}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {appointment.patient.nama_lengkap}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            RM: {appointment.patient.nomor_rekam_medis}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {appointment.doctor.nama_lengkap}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {appointment.keluhan || '-'}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <AppointmentStatusBadge status={appointment.status} />
                                    {appointment.medical_record && (
                                        <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Rekam medis tersedia</span>
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {onView && (
                                            <button
                                                onClick={() => onView(appointment)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Lihat detail"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}

                                        {appointment.status === AppointmentStatus.DIJADWALKAN && (
                                            <>
                                                {onCreateMedicalRecord && !appointment.medical_record && (
                                                    <button
                                                        onClick={() => onCreateMedicalRecord(appointment)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Buat rekam medis"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(appointment)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(appointment, AppointmentStatus.SELESAI)
                                                    }
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Tandai selesai"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(appointment)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    showInfo
                    startIndex={(currentPage - 1) * 10}
                    endIndex={Math.min(currentPage * 10, totalItems)}
                    totalItems={totalItems}
                />
            )}
        </div>
    );
}