'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientForm } from '@/components/forms/PatientForm';
import { useToastStore } from '@/lib/store/toastStore';
import * as patientService from '@/lib/api';
import { PatientFormData } from '@/lib/validators/patientSchema';
import { ArrowLeft } from 'lucide-react';

/**
 * Halaman Tambah Pasien Baru
 * 
 * Role Access:
 * - Kepala Klinik: ✅ Allowed
 * - Staf: ✅ Allowed
 * - Dokter: ❌ Denied
 */
export default function NewPatientPage() {
    const router = useRouter();
    const { can } = usePermission();
    const { success, error } = useToastStore();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // ===== RBAC Check =====
    const canCreate = can(Permission.CREATE_PATIENT);

    useEffect(() => {
        if (!canCreate) {
            error('Anda tidak memiliki izin untuk menambah pasien');
            router.push('/dashboard/patients');
        }
    }, [canCreate]);

    // ===== Handlers =====
    const handleSubmit = async (data: PatientFormData) => {
        setIsSubmitting(true);
        try {
            const newPatient = await patientService.createPatient(data);
            success('Pasien berhasil ditambahkan');
            router.push(`/dashboard/patients/${newPatient.id}`);
        } catch (err: any) {
            error(err.message || 'Gagal menambahkan pasien');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/patients');
    };

    // ===== Render =====
    if (!canCreate) {
        return null; // Redirect handled in useEffect
    }

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
                    Tambah Pasien Baru
                </h1>
                <p className="text-gray-600 mt-1">
                    Isi formulir di bawah untuk menambah pasien baru
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <PatientForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}