'use client';

import React from 'react';
import { MedicalRecord } from '@/types/api';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { formatSOAPNotes } from '@/lib/formatters/medicalRecordFormatter';
import { User, Calendar, FileText, Activity, Stethoscope, ClipboardCheck, Printer } from 'lucide-react';

interface MedicalRecordViewProps {
    record: MedicalRecord;
    onPrint?: () => void;
    onEdit?: () => void;
}

export function MedicalRecordView({ record, onPrint, onEdit }: MedicalRecordViewProps) {
    const soapNotes = formatSOAPNotes(record);
    const appointment = record.appointment;
    const patient = appointment.patient;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Rekam Medis</h2>
                        <p className="text-purple-100">
                            {formatDate(appointment.tanggal_janji, 'EEEE, dd MMMM yyyy')}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                        )}
                        {onPrint && (
                            <button
                                onClick={onPrint}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Printer className="w-5 h-5" />
                                <span>Cetak</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Patient Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Informasi Pasien
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                        <p className="font-medium text-gray-900">{patient.nama_lengkap}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">No. Rekam Medis</p>
                        <p className="font-medium text-gray-900">{patient.nomor_rekam_medis}</p>
                    </div>

                    {patient.tanggal_lahir && (
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tanggal Lahir</p>
                            <p className="font-medium text-gray-900">{formatDate(patient.tanggal_lahir)}</p>
                        </div>
                    )}

                    {patient.jenis_kelamin && (
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Jenis Kelamin</p>
                            <p className="font-medium text-gray-900">
                                {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Visit Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Informasi Kunjungan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Tanggal Kunjungan</p>
                        <p className="font-medium text-gray-900">
                            {formatDate(appointment.tanggal_janji, 'dd MMMM yyyy')}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Dokter Pemeriksa</p>
                        <p className="font-medium text-gray-900">{appointment.doctor.nama_lengkap}</p>
                    </div>

                    {appointment.keluhan && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-1">Keluhan Awal</p>
                            <p className="text-gray-900">{appointment.keluhan}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SOAP Notes */}
            <div className="space-y-4">
                {/* Subjective */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Subjektif (S) - Keluhan Pasien
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-900 whitespace-pre-wrap">{soapNotes.subjektif}</p>
                    </div>
                </div>

                {/* Objective */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-6 py-3 border-b border-green-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Objektif (O) - Hasil Pemeriksaan
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-900 whitespace-pre-wrap">{soapNotes.objektif}</p>
                    </div>
                </div>

                {/* Assessment */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-purple-50 px-6 py-3 border-b border-purple-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-purple-600" />
                            Assessment (A) - Diagnosis
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-900 whitespace-pre-wrap">{soapNotes.assessment}</p>
                    </div>
                </div>

                {/* Plan */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-orange-50 px-6 py-3 border-b border-orange-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-orange-600" />
                            Plan (P) - Rencana Perawatan
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-900 whitespace-pre-wrap">{soapNotes.plan}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p>Dibuat pada: {formatDateTime(record.created_at)}</p>
                {record.updated_at !== record.created_at && (
                    <p>Diperbarui pada: {formatDateTime(record.updated_at)}</p>
                )}
            </div>
        </div>
    );
}