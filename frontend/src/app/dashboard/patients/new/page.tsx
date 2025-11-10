'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientForm } from '@/components/forms/PatientForm';
import { useToastStore } from '@/lib/store/toastStore';
import * as patientService from '@/lib/api';
import { PatientFormData } from '@/lib/validators/patientSchema';
import { ArrowLeft, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function NewPatientPage() {
    // ===== BAGIAN 1: SEMUA HOOKS DI ATAS =====
    // Semua Hook harus dipanggil di sini, sebelum return kondisional

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { can } = usePermission();
    const { success, error } = useToastStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Logika yang bergantung pada Hook juga pindah ke atas
    const canCreate = can(Permission.CREATE_PATIENT);

    // Hook 'useEffect' juga harus di atas
    useEffect(() => {
        // Tambahkan pengecekan loading di *dalam* effect
        if (authLoading) {
            return; // Jangan lakukan apa-apa jika auth masih loading
        }

        // Setelah loading selesai, baru cek permission
        if (!canCreate) {
            error('Anda tidak memiliki izin untuk menambah pasien');
            router.push('/dashboard/patients');
        }
        // Tambahkan authLoading sebagai dependency
    }, [authLoading, canCreate, router, error]);


    // ===== BAGIAN 2: GUARD CLAUSES (EARLY RETURNS) =====
    // Sekarang aman untuk melakukan early return karena semua Hook sudah dipanggil

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

    // Pengecekan izin untuk render (sambil menunggu redirect dari useEffect)
    if (!canCreate) {
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
    // Kode ini hanya akan berjalan jika loading selesai, user ada, dan izin ada

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