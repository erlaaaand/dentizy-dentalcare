'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientForm } from '@/components/forms/PatientForm';
import { useToastStore } from '@/lib/store/toastStore';
import * as patientService from '@/lib/api';
import { Patient } from '@/types/api';
import { PatientFormData } from '@/lib/validators/patientSchema';
import { ArrowLeft } from 'lucide-react';

/**
 * Halaman Edit Pasien
 * 
 * Role Access:
 * - Kepala Klinik: ✅ Allowed
 * - Staf: ✅ Allowed
 * - Dokter: ❌ Denied
 */
export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = Number(params.id);

    const { can } = usePermission();
    const { success, error } = useToastStore();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===== RBAC Check =====
    const canUpdate = can(Permission.UPDATE_PATIENT);

    useEffect(() => {
        if (!canUpdate) {
            error('Anda tidak memiliki izin untuk mengedit pasien');
            router.push('/dashboard/patients');
            return;
        }

        loadPatient();
    }, [canUpdate, patientId]);

    // ===== Load Patient Data =====
    const loadPatient = async () => {
        if (isNaN(patientId)) {
            error('ID pasien tidak valid');
            router.push('/dashboard/patients');
            return;
        }

        setLoading(true);
        try {
            const data = await patientService.getPatientById(patientId);
            setPatient(data);
        } catch (err: any) {
            error(err.message || 'Gagal memuat data pasien');
            router.push('/dashboard/patients');
        } finally {
            setLoading(false);
        }
    };

    // ===== Handlers =====
    const handleSubmit = async (data: PatientFormData) => {
        setIsSubmitting(true);
        try {
            await patientService.updatePatient(patientId, data);
            success('Data pasien berhasil diperbarui');
            router.push(`/dashboard/patients/${patientId}`);
        } catch (err: any) {
            error(err.message || 'Gagal memperbarui data pasien');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/patients/${patientId}`);
    };

    // ===== Loading State =====
    if (loading || !patient) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ===== Access Denied =====
    if (!canUpdate) {
        return null; // Redirect handled in useEffect
    }

    // ===== Main Render =====
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Data Pasien
                </h1>
                <p className="text-gray-600 mt-1">
                    Perbarui informasi pasien: {patient.nama_lengkap}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <PatientForm
                    initialData={patient}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}