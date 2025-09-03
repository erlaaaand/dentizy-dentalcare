'use client';

import React from 'react';

// Sesuaikan tipe data dengan struktur database
type Appointment = {
    id: number;
    patient_id: number;
    doctor_id: number;
    status: 'dijadwalkan' | 'selesai' | 'dibatalkan';
    created_at: string;
    updated_at: string;
    tanggal_janji: string;
    keluhan?: string;
    jam_janji: string;
    // Data tambahan dari JOIN dengan tabel patients dan doctors
    patient_name?: string;
    doctor_name?: string;
    treatment?: string;
};

type AppointmentsTableProps = {
    appointments: Appointment[];
    isLoading: boolean;
    error: string | null;
    onActionSuccess: () => void;
};

export default function AppointmentsTable({ appointments, isLoading, error, onActionSuccess }: AppointmentsTableProps) {
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'selesai': return 'Selesai';
            case 'dijadwalkan': return 'Dijadwalkan';
            case 'dibatalkan': return 'Dibatalkan';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString: string) => {
        try {
            // Jika timeString sudah dalam format HH:MM:SS, langsung return
            if (timeString.includes(':')) {
                return timeString.substring(0, 5); // Ambil HH:MM saja
            }
            return timeString;
        } catch {
            return timeString;
        }
    };

    const handleComplete = async (appointmentId: number) => {
        try {
            // TODO: Implementasi API call untuk mengubah status menjadi 'selesai'
            console.log('Menyelesaikan appointment dengan ID:', appointmentId);
            // Panggil onActionSuccess setelah berhasil
            onActionSuccess();
        } catch (error) {
            console.error('Error completing appointment:', error);
        }
    };

    const handleCancel = async (appointmentId: number) => {
        try {
            // TODO: Implementasi API call untuk mengubah status menjadi 'dibatalkan'
            console.log('Membatalkan appointment dengan ID:', appointmentId);
            // Panggil onActionSuccess setelah berhasil
            onActionSuccess();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal & Jam
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatDate(appt.tanggal_janji)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatTime(appt.jam_janji)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {appt.patient_name || `Patient ID: ${appt.patient_id}`}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {appt.doctor_name || `Doctor ID: ${appt.doctor_id}`}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {appt.keluhan || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(appt.status)}`}>
                                        {getStatusLabel(appt.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                                        onClick={() => console.log('Detail appointment:', appt.id)}
                                    >
                                        Detail
                                    </button>

                                    {appt.status === 'dijadwalkan' && (
                                        <>
                                            <button
                                                className="text-green-600 hover:text-green-900 font-medium transition-colors"
                                                onClick={() => handleComplete(appt.id)}
                                            >
                                                Selesaikan
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                                onClick={() => handleCancel(appt.id)}
                                            >
                                                Batalkan
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}