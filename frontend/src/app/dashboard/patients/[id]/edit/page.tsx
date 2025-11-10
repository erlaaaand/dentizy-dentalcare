// frontend/src/app/dashboard/patients/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { usePatientDetail } from '@/lib/hooks/usePatientDetail';
import { PatientForm } from '@/components/forms/PatientForm';
import { useToastStore } from '@/lib/store/toastStore';
import * as patientService from '@/lib/api';
import { PatientFormData } from '@/lib/validators/patientSchema';
import { ArrowLeft, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth'; // <-- 1. Tambahkan import useAuth

export default function EditPatientPage() {
    // ===== BAGIAN 1: SEMUA HOOKS DI ATAS =====
    const router = useRouter();
    const params = useParams();
    const patientId = Number(params.id);

    const { user, loading: authLoading } = useAuth(); // <-- 2. Panggil useAuth
    const { can } = usePermission();
    const { success, error } = useToastStore();
    // 3. Ganti nama 'loading' agar unik
    const { patient, loading: patientDataLoading } = usePatientDetail({ patientId });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Logika yang bergantung pada Hook
    const canUpdate = can(Permission.UPDATE_PATIENT);

    // 4. Pindahkan useEffect ke atas dan perbaiki logikanya
    useEffect(() => {
        if (authLoading) {
            return; // Tunggu auth selesai loading
        }

        // Setelah auth selesai, baru cek izin
        if (!canUpdate) {
            error('Anda tidak memiliki izin untuk mengedit pasien');
            router.push('/dashboard/patients');
        }
        // 5. Tambahkan dependency yang benar
    }, [authLoading, canUpdate, router, error]);


    // ===== BAGIAN 2: GUARD CLAUSES (EARLY RETURNS) =====
    // Urutan guard: Auth Loading -> Auth User -> Data Loading -> Data -> Permission

    // 6. Guard untuk Auth Loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data user...</p>
                </div>
            </div>
        );
    }

    // 7. Guard untuk Session Expired
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Session Expired
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Silakan login kembali untuk melanjutkan.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    // 8. Guard untuk Loading Data Pasien
    if (patientDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data pasien...</p>
                </div>
            </div>
        );
    }

    // 9. Guard jika pasien tidak ditemukan setelah loading
    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Data Pasien Tidak Ditemukan
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Data pasien dengan ID {patientId} tidak dapat ditemukan.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/patients')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                    >
                        Kembali ke Daftar Pasien
                    </button>
                </div>
            </div>
        );
    }

    // 10. Guard untuk Akses Ditolak (menunggu redirect dari useEffect)
    if (!canUpdate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="text-center max-w-md">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Akses Ditolak
                    </h2>
                    <p className="text-gray-600">
                        Anda tidak memiliki izin untuk mengakses halaman ini. Mengalihkan...
                    </p>
                </div>
            </div>
        );
    }


    // ===== BAGIAN 3: HANDLERS & RENDER LOGIC =====
    // Kode ini hanya berjalan jika semua pengecekan di atas lolos

    // Handlers
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

    // Main Render
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali ke Detail</span>
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