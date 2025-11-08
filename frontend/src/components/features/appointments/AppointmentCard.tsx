'use client';

import React from 'react';
import { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/formatters';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Calendar, Clock, User, FileText, Stethoscope } from 'lucide-react';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: () => void;
    showPatient?: boolean;
    showDoctor?: boolean;
    actions?: React.ReactNode;
}

export function AppointmentCard({
    appointment,
    onClick,
    showPatient = true,
    showDoctor = true,
    actions,
}: AppointmentCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 transition-all ${onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">
                            {formatDate(appointment.tanggal_janji, 'EEEE, dd MMMM yyyy')}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(appointment.jam_janji)}
                        </p>
                    </div>
                </div>

                <AppointmentStatusBadge status={appointment.status} />
            </div>

            {/* Content */}
            <div className="space-y-3">
                {showPatient && (
                    <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Pasien</p>
                            <p className="font-medium text-gray-900">{appointment.patient.nama_lengkap}</p>
                            <p className="text-xs text-gray-500">RM: {appointment.patient.nomor_rekam_medis}</p>
                        </div>
                    </div>
                )}

                {showDoctor && (
                    <div className="flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Dokter</p>
                            <p className="font-medium text-gray-900">{appointment.doctor.nama_lengkap}</p>
                        </div>
                    </div>
                )}

                {appointment.keluhan && (
                    <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Keluhan</p>
                            <p className="text-gray-900">{appointment.keluhan}</p>
                        </div>
                    </div>
                )}

                {appointment.medical_record && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <FileText className="w-4 h-4" />
                            <span>Rekam medis telah dibuat</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {actions && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}