'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientProvider, usePatients } from '@/contexts/PatientContext';
import { PatientList } from '@/components/features/patients/PatientList';
import { Patient } from '@/types/api';
import { Users, AlertCircle } from 'lucide-react';
import TableSkeleton from '@/components/ui/TableSkeleton';

function PatientsPageContent() {
    const router = useRouter();
    const { can } = usePermission();
    const { isDokter, loading } = usePatients();

    if (loading) {
        return (
            <div className="skeleton">
                <TableSkeleton rows={6} columns={5} />
            </div>
        );
    }

    // Gunakan hook usePermission sebagai satu-satunya sumber kebenaran
    const canViewPatients = can(Permission.VIEW_PATIENTS);

    if (!canViewPatients) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Akses Ditolak
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                </div>
            </div>
        );
    }

    // Dapatkan permission lain yang diperlukan untuk UI
    const canCreatePatient = can(Permission.CREATE_PATIENT);
    const canUpdatePatient = can(Permission.UPDATE_PATIENT);

    // Handlers
    const handleViewPatient = (patient: Patient) => {
        router.push(`/dashboard/patients/${patient.id}`);
    };

    const handleEditPatient = (patient: Patient) => {
        if (canUpdatePatient) {
            router.push(`/dashboard/patients/${patient.id}/edit`);
        }
    };

    const handleAddPatient = () => {
        if (canCreatePatient) {
            router.push('/dashboard/patients/new');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manajemen Pasien
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isDokter
                            ? 'Daftar pasien yang ditugaskan kepada Anda'
                            : 'Kelola data pasien klinik'}
                    </p>
                </div>
            </div>

            {/* Patient List Component */}
            <PatientList
                onView={handleViewPatient}
                onEdit={canUpdatePatient ? handleEditPatient : undefined}
                onAdd={canCreatePatient ? handleAddPatient : undefined}
            />
        </div>
    );
}

// Komponen 'PatientsPage' (Wrapper) tidak perlu diubah
export default function PatientsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Loading & Auth Check
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data user...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
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

    return (
        <PatientProvider>
            <PatientsPageContent />
        </PatientProvider>
    );
}