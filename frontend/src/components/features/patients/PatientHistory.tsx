'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types/api';
import { patientService } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { formatDate, formatTime } from '@/lib/formatters';
import { AppointmentStatusBadge } from '../appointments/AppointmentStatusBadge';
import { Calendar, User, FileText, Clock } from 'lucide-react';

interface PatientHistoryProps {
    patientId: number;
    onViewAppointment?: (appointment: Appointment) => void;
    limit?: number;
}

export function PatientHistory({ patientId, onViewAppointment, limit }: PatientHistoryProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    const { error } = useToastStore();

    useEffect(() => {
        loadHistory();
    }, [patientId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await patientService.getHistory(patientId);
            setAppointments(limit ? data.slice(0, limit) : data);
        } catch (err: any) {
            error(err.message || 'Gagal memuat riwayat kunjungan');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada riwayat kunjungan</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {appointments.map((appointment) => (
                <div
                    key={appointment.id}
                    onClick={() => onViewAppointment?.(appointment)}
                    className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${onViewAppointment ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    {formatDate(appointment.tanggal_janji, 'dd MMMM yyyy')}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(appointment.jam_janji)}
                                </p>
                            </div>
                        </div>

                        <AppointmentStatusBadge status={appointment.status} />
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Dokter: {appointment.doctor.nama_lengkap}</span>
                        </div>

                        {appointment.keluhan && (
                            <div className="flex items-start gap-2 text-gray-700">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="flex-1">{appointment.keluhan}</span>
                            </div>
                        )}

                        {appointment.medical_record && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Rekam medis tersedia
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}