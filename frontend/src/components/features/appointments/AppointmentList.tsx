'use client';

import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '@/types/api';
import { appointmentService } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { usePagination } from '@/lib/hooks';
import { formatDate, formatTime } from '@/lib/formatters';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Plus, Edit, Trash2, Eye, FileText, Calendar as CalendarIcon } from 'lucide-react';

interface AppointmentListProps {
    onEdit?: (appointment: Appointment) => void;
    onView?: (appointment: Appointment) => void;
    onAdd?: () => void;
    onCreateMedicalRecord?: (appointment: Appointment) => void;
}

export function AppointmentList({ onEdit, onView, onAdd, onCreateMedicalRecord }: AppointmentListProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
    const [dateFilter, setDateFilter] = useState('');

    const { success, error } = useToastStore();
    const { confirmDelete } = useConfirm();

    const [totalItems, setTotalItems] = useState(0);
    const {
        currentPage,
        itemsPerPage,
        goToNextPage,
        goToPreviousPage,
        canGoNext,
        canGoPrevious,
    } = usePagination({ totalItems, itemsPerPage: 10 });

    useEffect(() => {
        loadAppointments();
    }, [currentPage, statusFilter, dateFilter]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getAll({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter || undefined,
                date: dateFilter || undefined,
            });

            setAppointments(response.data);
            setTotalItems(response.pagination.total);
        } catch (err: any) {
            error(err.message || 'Gagal memuat data janji temu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (appointment: Appointment) => {
        await confirmDelete(
            `janji temu untuk ${appointment.patient.nama_lengkap}`,
            async () => {
                try {
                    await appointmentService.delete(appointment.id);
                    success('Janji temu berhasil dihapus');
                    loadAppointments();
                } catch (err: any) {
                    error(err.message || 'Gagal menghapus janji temu');
                }
            }
        );
    };

    const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
        try {
            await appointmentService.updateStatus(appointment.id, newStatus);
            success('Status berhasil diperbarui');
            loadAppointments();
        } catch (err: any) {
            error(err.message || 'Gagal memperbarui status');
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                    <label htmlFor="date-filter" className="sr-only">Filter Tanggal</label>
                    <input
                        id="date-filter"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex-1 max-w-xs">
                    <label htmlFor="status-filter" className="sr-only">Filter Status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Semua Status</option>
                        <option value={AppointmentStatus.DIJADWALKAN}>Dijadwalkan</option>
                        <option value={AppointmentStatus.SELESAI}>Selesai</option>
                        <option value={AppointmentStatus.DIBATALKAN}>Dibatalkan</option>
                    </select>
                </div>

                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ml-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Janji</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pasien
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dokter
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal & Waktu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Keluhan
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada data janji temu
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.patient.nama_lengkap}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.patient.nomor_rekam_medis}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {appointment.doctor.nama_lengkap}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <div>{formatDate(appointment.tanggal_janji, 'dd MMM yyyy')}</div>
                                                    <div className="text-gray-500">{formatTime(appointment.jam_janji)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <AppointmentStatusBadge status={appointment.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {appointment.keluhan || '-'}
                                            </div>
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
                                                        {onCreateMedicalRecord && (
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
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(appointment)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && appointments.length > 0 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={goToPreviousPage}
                                disabled={!canGoPrevious}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={!canGoNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari{' '}
                                    <span className="font-medium">{totalItems}</span> data
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={!canGoPrevious}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={goToNextPage}
                                        disabled={!canGoNext}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next →
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}