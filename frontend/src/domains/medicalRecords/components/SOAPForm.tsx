'use client';

import React, { useState, useEffect } from 'react';
import { MedicalRecord, Appointment } from '@/core/types/api';
import {
    validateMedicalRecordForm,
    sanitizeMedicalRecordFormData,
    MedicalRecordFormData,
    validateSOAPNotes,
} from '@/core/validators/medicalRecord.schema';
import {
    FileText,
    Activity,
    ClipboardCheck,
    Stethoscope,
    AlertCircle,
    Save,
    X,
    CheckCircle,
} from 'lucide-react';

interface SOAPFormProps {
    appointment: Appointment;
    initialData?: MedicalRecord;
    onSubmit: (data: Partial<MedicalRecordFormData>) => void | Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    autoSave?: boolean;
    autoSaveInterval?: number;
}

export function SOAPForm({
    appointment,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    autoSave = false,
    autoSaveInterval = 30000, // 30 seconds
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
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-save functionality
    useEffect(() => {
        if (!autoSave) return;

        const interval = setInterval(() => {
            if (Object.values(formData).some((val) => typeof val === 'string' && val.trim())) {
                handleAutoSave();
            }
        }, autoSaveInterval);

        return () => clearInterval(interval);
    }, [formData, autoSave, autoSaveInterval]);

    const handleAutoSave = async () => {
        const validation = validateMedicalRecordForm(formData);
        if (validation.isValid) {
            setIsSaving(true);
            try {
                const sanitizedData = sanitizeMedicalRecordFormData(formData);
                await onSubmit(sanitizedData);
                setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Calculate completion progress
    const completion = validateSOAPNotes(formData);
    const completedFieldsCount = 4 - completion.missingFields.length;

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

    const getFieldStatus = (field: keyof MedicalRecordFormData) => {
        const value = formData[field];
        if (!value || (typeof value === 'string' && value.trim().length === 0)) return 'empty';
        if (typeof value === 'string' && value.trim().length < 10) return 'incomplete';
        return 'complete';
    };

    const getStatusIcon = (field: keyof MedicalRecordFormData) => {
        const status = getFieldStatus(field);
        if (status === 'complete') {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (status === 'incomplete') {
            return <AlertCircle className="w-5 h-5 text-yellow-600" />;
        }
        return null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                            Pasien
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                            {appointment.patient.nama_lengkap}
                        </p>
                        <p className="text-sm text-gray-600">
                            {appointment.patient.jenis_kelamin === 'L'
                                ? 'Laki-laki'
                                : 'Perempuan'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                            No. Rekam Medis
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                            {appointment.patient.nomor_rekam_medis}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                            Tanggal Kunjungan
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                            {new Date(appointment.tanggal_janji).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.jam_janji}</p>
                    </div>
                </div>
            </div>

            {/* Auto-save Status */}
            {autoSave && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Menyimpan otomatis...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>
                                    Tersimpan otomatis pada{' '}
                                    {lastSaved.toLocaleTimeString('id-ID')}
                                </span>
                            </>
                        ) : (
                            <span>Auto-save aktif</span>
                        )}
                    </div>
                </div>
            )}

            {/* Completion Progress */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Progress Pengisian
                            </h3>
                            <p className="text-xs text-gray-600">
                                {completedFieldsCount} dari 4 bagian lengkap
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                            {completion.completionPercentage}%
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completion.completionPercentage}%` }}
                    />
                </div>
                {completion.missingFields.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p>
                            Bagian yang belum diisi:{' '}
                            <span className="font-medium">
                                {completion.missingFields
                                    .map((f) => f.toUpperCase())
                                    .join(', ')}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* SOAP Form Fields */}
            <div className="space-y-6">
                {/* Subjektif */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label
                        htmlFor="subjektif"
                        className="flex items-center justify-between mb-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-base font-semibold text-gray-900">
                                    Subjektif (S) - Keluhan Pasien
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Keluhan yang disampaikan pasien
                                </p>
                            </div>
                        </div>
                        {getStatusIcon('subjektif')}
                    </label>
                    <textarea
                        id="subjektif"
                        name="subjektif"
                        value={formData.subjektif}
                        onChange={handleChange}
                        onBlur={() => handleBlur('subjektif')}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showError('subjektif')
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        placeholder="Contoh: Pasien mengeluh sakit gigi bagian kiri bawah sejak 3 hari yang lalu, nyeri bertambah saat mengunyah makanan..."
                        disabled={isLoading}
                    />
                    {showError('subjektif') && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.subjektif}
                        </p>
                    )}
                </div>

                {/* Objektif */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label
                        htmlFor="objektif"
                        className="flex items-center justify-between mb-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <span className="text-base font-semibold text-gray-900">
                                    Objektif (O) - Hasil Pemeriksaan
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Temuan dari pemeriksaan fisik
                                </p>
                            </div>
                        </div>
                        {getStatusIcon('objektif')}
                    </label>
                    <textarea
                        id="objektif"
                        name="objektif"
                        value={formData.objektif}
                        onChange={handleChange}
                        onBlur={() => handleBlur('objektif')}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showError('objektif')
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        placeholder="Contoh: Gigi 36 terdapat kavitas profunda, perkusi (+), palpasi (-), mobilitas normal. Gingiva sekitar normal..."
                        disabled={isLoading}
                    />
                    {showError('objektif') && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.objektif}
                        </p>
                    )}
                </div>

                {/* Assessment */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label
                        htmlFor="assessment"
                        className="flex items-center justify-between mb-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <span className="text-base font-semibold text-gray-900">
                                    Assessment (A) - Diagnosis
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Penilaian dan diagnosis kondisi
                                </p>
                            </div>
                        </div>
                        {getStatusIcon('assessment')}
                    </label>
                    <textarea
                        id="assessment"
                        name="assessment"
                        value={formData.assessment}
                        onChange={handleChange}
                        onBlur={() => handleBlur('assessment')}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showError('assessment')
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        placeholder="Contoh: Pulpitis reversibel pada gigi 36. Prognosis baik jika dilakukan perawatan segera..."
                        disabled={isLoading}
                    />
                    {showError('assessment') && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.assessment}
                        </p>
                    )}
                </div>

                {/* Plan */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label htmlFor="plan" className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <span className="text-base font-semibold text-gray-900">
                                    Plan (P) - Rencana Perawatan
                                </span>
                                <span className="text-red-500 ml-1">*</span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Tindakan dan pengobatan yang akan dilakukan
                                </p>
                            </div>
                        </div>
                        {getStatusIcon('plan')}
                    </label>
                    <textarea
                        id="plan"
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                        onBlur={() => handleBlur('plan')}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showError('plan') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        placeholder="Contoh: Rencana perawatan endodontik (PSA), prescribe analgesik (Ibuprofen 400mg 3x1), kontrol 1 minggu..."
                        disabled={isLoading}
                    />
                    {showError('plan') && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.plan}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="w-5 h-5" />
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isLoading || completion.completionPercentage < 100}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>
                                {initialData ? 'Update Rekam Medis' : 'Simpan Rekam Medis'}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}