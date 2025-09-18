'use client';

import React from 'react';
import { cancelAppointment, completeAppointment } from '@/lib/api/appointmentService';
import { Appointment } from '@/types/api';

type AppointmentsTableProps = {
    appointments: Appointment[];
    isLoading: boolean;
    error: string | null;
    pagination: { page: number; limit: number; total: number; };
    onPageChange: (newPage: number) => void;
    onActionSuccess: () => void;
    onSelectAppointment: (appointment: Appointment) => void;
};

export default function AppointmentsTable({ 
    appointments, 
    isLoading, 
    error, 
    pagination, 
    onPageChange, 
    onActionSuccess, 
    onSelectAppointment 
}: AppointmentsTableProps) {
    if (isLoading) {
        return <div className="flex justify-center p-8">Memuat data...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
    }

    if (!appointments || appointments.length === 0) {
        return <div className="text-gray-500 p-8 text-center">Tidak ada janji temu ditemukan</div>;
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'selesai': return 'bg-green-100 text-green-800';
            case 'dijadwalkan': return 'bg-blue-100 text-blue-800';
            case 'dibatalkan': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    // ✅ FUNGSI UNTUK MENGHITUNG NOMOR URUT YANG BENAR
    const getRowNumber = (index: number) => {
        return (pagination.page - 1) * pagination.limit + index + 1;
    };

    const handleComplete = async (appointmentId: number) => {
        if (!confirm('Apakah Anda yakin ingin menyelesaikan janji temu ini?')) return;
        try {
            await completeAppointment(appointmentId);
            alert('Janji temu berhasil diselesaikan!');
            onActionSuccess();
        } catch (error) {
            console.error('Error completing appointment:', error);
            alert('Gagal menyelesaikan janji temu.');
        }
    };

    const handleCancel = async (appointmentId: number) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan janji temu ini?')) return;
        try {
            await cancelAppointment(appointmentId);
            alert('Janji temu berhasil dibatalkan.');
            onActionSuccess();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Gagal membatalkan janji temu.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal & Jam</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appt, index) => (
                            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* ✅ PENOMORAN YANG BENAR DENGAN PERHITUNGAN HALAMAN */}
                                    <div className="text-sm font-medium text-gray-900">
                                        {getRowNumber(index)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{formatDate(appt.tanggal_janji)}</div>
                                    <div className="text-sm text-gray-500">{formatTime(appt.jam_janji)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{appt.patient?.nama_lengkap || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{appt.doctor?.nama_lengkap || 'N/A'}</div>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        onClick={() => onSelectAppointment(appt)}
                                        className="text-blue-600 hover:text-blue-900 font-medium">
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Paginasi dengan informasi yang lebih akurat */}
            <div className="p-4 flex justify-between items-center border-t border-gray-200">
                <span className="text-sm text-gray-700">
                    {/* ✅ INFORMASI RANGE DATA YANG DITAMPILKAN */}
                    Menampilkan {getRowNumber(0)} - {getRowNumber(appointments.length - 1)} dari {pagination.total} data
                </span>
                <div className="space-x-2">
                    <button 
                        onClick={() => onPageChange(pagination.page - 1)} 
                        disabled={pagination.page <= 1} 
                        className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Sebelumnya
                    </button>
                    
                    {/* ✅ TAMBAHAN: Menampilkan nomor halaman saat ini */}
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                        Halaman {pagination.page}
                    </span>
                    
                    <button 
                        onClick={() => onPageChange(pagination.page + 1)} 
                        disabled={(pagination.page * pagination.limit) >= pagination.total} 
                        className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    );
}