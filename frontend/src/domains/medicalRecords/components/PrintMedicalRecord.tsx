'use client';

import React from 'react';
import { MedicalRecord } from '@/core/types/api';
import { formatDate, formatDateTime } from '@/core/formatters';
import { formatSOAPNotes } from '@/core/formatters/medicalRecord.formatter';

interface PrintMedicalRecordProps {
    record: MedicalRecord;
}

export function PrintMedicalRecord({ record }: PrintMedicalRecordProps) {
    const soapNotes = formatSOAPNotes(record);
    const appointment = record.appointment;
    const patient = appointment.patient;

    return (
        <div className="print-only bg-white p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="medical-record-header text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">REKAM MEDIS PASIEN</h1>
                <p className="text-lg text-gray-700">Sistem Manajemen Klinik</p>
            </div>

            {/* Patient Info */}
            <div className="patient-info mb-6">
                <h2 className="text-xl font-bold mb-4">INFORMASI PASIEN</h2>
                <div className="patient-info-item">
                    <span className="patient-info-label">Nama Lengkap:</span>
                    <span>{patient.nama_lengkap}</span>
                </div>
                <div className="patient-info-item">
                    <span className="patient-info-label">No. Rekam Medis:</span>
                    <span>{patient.nomor_rekam_medis}</span>
                </div>
                {patient.tanggal_lahir && (
                    <div className="patient-info-item">
                        <span className="patient-info-label">Tanggal Lahir:</span>
                        <span>{formatDate(patient.tanggal_lahir)}</span>
                    </div>
                )}
                {patient.jenis_kelamin && (
                    <div className="patient-info-item">
                        <span className="patient-info-label">Jenis Kelamin:</span>
                        <span>{patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                )}
                <div className="patient-info-item">
                    <span className="patient-info-label">Tanggal Kunjungan:</span>
                    <span>{formatDate(appointment.tanggal_janji, 'dd MMMM yyyy')}</span>
                </div>
                <div className="patient-info-item">
                    <span className="patient-info-label">Dokter Pemeriksa:</span>
                    <span>{appointment.doctor.nama_lengkap}</span>
                </div>
            </div>

            {/* SOAP Notes */}
            <div className="medical-record-section">
                <div className="soap-section">
                    <div className="soap-title">SUBJEKTIF (S) - Keluhan Pasien</div>
                    <div className="soap-content">{soapNotes.subjektif}</div>
                </div>

                <div className="soap-section">
                    <div className="soap-title">OBJEKTIF (O) - Hasil Pemeriksaan</div>
                    <div className="soap-content">{soapNotes.objektif}</div>
                </div>

                <div className="soap-section">
                    <div className="soap-title">ASSESSMENT (A) - Diagnosis</div>
                    <div className="soap-content">{soapNotes.assessment}</div>
                </div>

                <div className="soap-section">
                    <div className="soap-title">PLAN (P) - Rencana Perawatan</div>
                    <div className="soap-content">{soapNotes.plan}</div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="signature-area mt-16">
                <div className="signature-box">
                    <div className="signature-line">
                        <p className="font-bold">{appointment.doctor.nama_lengkap}</p>
                        <p>Dokter Pemeriksa</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="print-footer">
                <p>Dicetak pada: {formatDateTime(new Date())}</p>
            </div>
        </div>
    );
}