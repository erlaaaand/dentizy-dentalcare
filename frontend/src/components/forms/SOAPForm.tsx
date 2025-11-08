'use client';

import React, { useState } from 'react';
import { MedicalRecord, Appointment } from '@/types/api';
import {
    validateMedicalRecordForm,
    sanitizeMedicalRecordFormData,
    MedicalRecordFormData,
    validateSOAPNotes,
} from '@/lib/validators/medicalRecordSchema';
import { FileText, Activity, ClipboardCheck, Stethoscope } from 'lucide-react';

interface SOAPFormProps {
    appointment: Appointment;
    initialData?: MedicalRecord;
    onSubmit: (data: Partial<MedicalRecordFormData>) => void | Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function SOAPForm({
    appointment,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: SOAPFormProps) {
    const [formData, setFormData] = useState<Partial<MedicalRecordFormData>>({
        subjektif: initialData?.subjektif || '',
        objektif: initialData?.objektif || '',
        assessment: initialData?.assessment || '',
        plan: initialData?.plan || '',
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof MedicalRecordFormData, string>>
    >({});
    const [touched, setTouched] = useState<
        Partial<Record<keyof MedicalRecordFormData, boolean>>
    >({});

    // Calculate completion progress
    const completion = validateSOAPNotes(formData);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof MedicalRecordFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (field: keyof MedicalRecordFormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const allTouched: Partial<Record<keyof MedicalRecordFormData, boolean>> = {
            subjektif: true,
            objektif: true,
            assessment: true,
            plan: true,
        };
        setTouched(allTouched);

        const validation = validateMedicalRecordForm(formData);

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        const sanitizedData = sanitizeMedicalRecordFormData(formData);
        await onSubmit(sanitizedData);
    };

    const showError = (field: keyof MedicalRecordFormData) => {
        return touched[field] && errors[field];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ==================== Patient Info Header ==================== */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Pasien</p>
                        <p className="font-medium text-gray-900">
                            {appointment.patient.nama_lengkap}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">No. RM</p>
                        <p className="font-medium text-gray-900">
                            {appointment.patient.nomor_rekam_medis}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tanggal Kunjungan</p>
                        <p className="font-medium text-gray-900">
                            {new Date(appointment.tanggal_janji).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* ==================== Completion Progress ==================== */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Kelengkapan Data
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                        {completion.completionPercentage}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completion.completionPercentage}%` }}
                    />
                </div>
                {completion.missingFields.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                        Belum diisi:{' '}
                        {completion.missingFields.map((f) => f.toUpperCase()).join(', ')}
                    </p>
                )}
            </div>

            {/* ==================== Subjektif ==================== */}
            <div>
                <label
                    htmlFor="subjektif"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>
                        Subjektif (S) - Keluhan Pasien{' '}
                        <span className="text-red-500">*</span>
                    </span>
                </label>
                <textarea
                    id="subjektif"
                    name="subjektif"
                    value={formData.subjektif}
                    onChange={handleChange}
                    onBlur={() => handleBlur('subjektif')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('subjektif') ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Catatan keluhan yang disampaikan pasien..."
                    disabled={isLoading}
                />
                {showError('subjektif') && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjektif}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Contoh: Pasien mengeluh demam tinggi sejak 3 hari, disertai batuk dan
                    pilek.
                </p>
            </div>

            {/* ==================== Objektif ==================== */}
            <div>
                <label
                    htmlFor="objektif"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>
                        Objektif (O) - Hasil Pemeriksaan{' '}
                        <span className="text-red-500">*</span>
                    </span>
                </label>
                <textarea
                    id="objektif"
                    name="objektif"
                    value={formData.objektif}
                    onChange={handleChange}
                    onBlur={() => handleBlur('objektif')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('objektif') ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Hasil pemeriksaan fisik, vital signs..."
                    disabled={isLoading}
                />
                {showError('objektif') && (
                    <p className="mt-1 text-sm text-red-600">{errors.objektif}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Contoh: TD 120/80 mmHg, Nadi 88x/menit, Suhu 38.5°C.
                </p>
            </div>

            {/* ==================== Assessment ==================== */}
            <div>
                <label
                    htmlFor="assessment"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                    <span>
                        Assessment (A) - Diagnosis <span className="text-red-500">*</span>
                    </span>
                </label>
                <textarea
                    id="assessment"
                    name="assessment"
                    value={formData.assessment}
                    onChange={handleChange}
                    onBlur={() => handleBlur('assessment')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('assessment') ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Diagnosis atau penilaian kondisi pasien..."
                    disabled={isLoading}
                />
                {showError('assessment') && (
                    <p className="mt-1 text-sm text-red-600">{errors.assessment}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Contoh: ISPA (Infeksi Saluran Pernapasan Atas) akut.
                </p>
            </div>

            {/* ==================== Plan ==================== */}
            <div>
                <label
                    htmlFor="plan"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                    <ClipboardCheck className="w-5 h-5 text-orange-600" />
                    <span>
                        Plan (P) - Rencana Perawatan{' '}
                        <span className="text-red-500">*</span>
                    </span>
                </label>
                <textarea
                    id="plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    onBlur={() => handleBlur('plan')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('plan') ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Rencana pengobatan, terapi, dan tindak lanjut..."
                    disabled={isLoading}
                />
                {showError('plan') && (
                    <p className="mt-1 text-sm text-red-600">{errors.plan}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Contoh: Paracetamol 500mg 3x1, Amoxicillin 500mg 3x1, kontrol 3 hari.
                </p>
            </div>

            {/* ==================== Actions ==================== */}
            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <span>
                            {initialData ? 'Update Rekam Medis' : 'Simpan Rekam Medis'}
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
}
