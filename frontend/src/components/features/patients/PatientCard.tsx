'use client';

import React from 'react';
import { Patient } from '@/types/api';
import { formatAge, formatPhoneNumber, getInitials } from '@/lib/formatters';
import { User, Phone, Mail, Calendar } from 'lucide-react';

interface PatientCardProps {
    patient: Patient;
    onClick?: () => void;
    showContact?: boolean;
}

export function PatientCard({ patient, onClick, showContact = true }: PatientCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all ${onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-lg">
                        {getInitials(patient.nama_lengkap)}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {patient.nama_lengkap}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                            <span className="font-medium">No. RM:</span>
                            <span>{patient.nomor_rekam_medis}</span>
                        </p>

                        {patient.tanggal_lahir && (
                            <p className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{formatAge(patient.tanggal_lahir)}</span>
                                {patient.jenis_kelamin && (
                                    <span>• {patient.jenis_kelamin === 'L' ? 'L' : 'P'}</span>
                                )}
                            </p>
                        )}

                        {showContact && (
                            <>
                                {patient.no_hp && (
                                    <p className="flex items-center gap-1 truncate">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{formatPhoneNumber(patient.no_hp)}</span>
                                    </p>
                                )}

                                {patient.email && (
                                    <p className="flex items-center gap-1 truncate">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{patient.email}</span>
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}