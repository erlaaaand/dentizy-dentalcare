'use client';

import React from 'react';

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
    patient_name?: string;
    doctor_name?: string;
    treatment?: string;
};

type DetailAppointmentModalProps = {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function DetailAppointmentModal({ appointment, isOpen, onClose }: DetailAppointmentModalProps) {
    if (!isOpen || !appointment) return null;

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
            case 'dijadwalkan': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'dibatalkan': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const formatDateTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString: string) => {
        try {
            if (timeString.includes(':')) {
                return timeString.substring(0, 5);
            }
            return timeString;
        } catch {
            return timeString;
        }
    };

    // Close modal when clicking outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close modal with Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Detail Janji Temu
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getStatusClass(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                        </span>
                    </div>

                    {/* Main Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID Janji Temu
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    #{appointment.id}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Pasien
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {appointment.patient_name || `ID Pasien: ${appointment.patient_id}`}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Dokter
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {appointment.doctor_name || `ID Dokter: ${appointment.doctor_id}`}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Janji
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {formatDate(appointment.tanggal_janji)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jam Janji
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {formatTime(appointment.jam_janji)} WIB
                                </p>
                            </div>

                            {appointment.treatment && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Perawatan
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                        {appointment.treatment}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Keluhan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keluhan
                        </label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">
                            {appointment.keluhan || 'Tidak ada keluhan yang dicatat'}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Informasi Sistem</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Dibuat pada:</span>
                                <br />
                                <span className="text-gray-900">{formatDateTime(appointment.created_at)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Terakhir diperbarui:</span>
                                <br />
                                <span className="text-gray-900">{formatDateTime(appointment.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Tutup
                    </button>

                    {appointment.status === 'dijadwalkan' && (
                        <button
                            onClick={() => {
                                // TODO: Implementasi edit appointment
                                console.log('Edit appointment:', appointment.id);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Edit Janji
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}