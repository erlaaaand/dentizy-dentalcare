'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientList } from '@/components/features/patients/PatientList';
import { Can } from '@/components/auth/Can';
import { UserRole } from '@/types/api';
import * as patientService from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { Patient } from '@/types/api';
import { Plus, Users, AlertCircle } from 'lucide-react';

/**
 * Halaman Manajemen Pasien dengan RBAC
 * 
 * Role Access:
 * - Kepala Klinik: Full CRUD + lihat semua pasien
 * - Staf: Full CRUD + lihat semua pasien
 * - Dokter: Read-only, hanya pasien yang ditugaskan
 */
export default function PatientsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { can } = usePermission();
    const { error } = useToastStore();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // ===== DEBUG: Log user & permissions =====
    useEffect(() => {
        if (user) {
            console.log('🔍 PATIENTS PAGE - User Data:', {
                id: user.id,
                username: user.username,
                roles: user.roles,
                roleNames: user.roles.map(r => typeof r === 'object' ? r.name : r)
            });
        }
    }, [user]);

    // ===== RBAC: Determine data access based on role =====
    const canViewAllPatients = can(Permission.VIEW_PATIENTS);
    const canCreatePatient = can(Permission.CREATE_PATIENT);
    const canUpdatePatient = can(Permission.UPDATE_PATIENT);
    const canDeletePatient = can(Permission.DELETE_PATIENT);

    // Log permissions
    useEffect(() => {
        console.log('🔍 PATIENTS PAGE - Permissions:', {
            canViewAllPatients,
            canCreatePatient,
            canUpdatePatient,
            canDeletePatient
        });
    }, [canViewAllPatients, canCreatePatient, canUpdatePatient, canDeletePatient]);

    // ===== Fetch Patients with Role-Based Filtering =====
    const loadPatients = async () => {
        if (!user) {
            console.log('⚠️ No user, skipping loadPatients');
            return;
        }

        setLoading(true);
        try {
            // RBAC Logic: Dokter hanya lihat pasien mereka
            const roleNames = user.roles.map(r => typeof r === 'object' ? r.name : r);
            const isDokter = roleNames.includes(UserRole.DOKTER);

            console.log('🔍 Loading patients:', { isDokter, userId: user.id });

            let response;
            if (isDokter) {
                // Fetch only patients assigned to this doctor
                console.log('📋 Fetching patients for doctor:', user.id);
                response = await patientService.getPatientsByDoctor({
                    doctor_id: user.id,
                    page: currentPage,
                    limit: 10,
                    search: searchQuery || undefined
                });
            } else {
                // Kepala Klinik & Staf: Fetch all patients
                console.log('📋 Fetching all patients');
                response = await patientService.getAllPatients({
                    page: currentPage,
                    limit: 10,
                    search: searchQuery || undefined
                });
            }

            console.log('✅ Patients loaded:', response.data.length);
            setPatients(response.data);
            setTotalItems(response.pagination.total);
        } catch (err: any) {
            console.error('❌ Error loading patients:', err);
            error(err.message || 'Gagal memuat data pasien');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            loadPatients();
        }
    }, [user, authLoading, currentPage, searchQuery]);

    // ===== Handlers =====
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

    // ===== Loading & Auth Check =====
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

    // ✅ FALLBACK: Jika permission check gagal, coba cek role langsung
    const roleNames = user.roles.map(r => typeof r === 'object' ? r.name : r);
    const hasAccessByRole = roleNames.some(role =>
        ['kepala_klinik', 'staf', 'dokter'].includes(role.toLowerCase())
    );

    if (!canViewAllPatients && !hasAccessByRole) {
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

                    {/* Debug info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-sm">
                        <p className="font-semibold text-yellow-900 mb-2">Debug Info:</p>
                        <p className="text-yellow-700">Roles: {roleNames.join(', ')}</p>
                        <p className="text-yellow-700">Permission: {String(canViewAllPatients)}</p>
                        <button
                            onClick={() => router.push('/dashboard/debug-user')}
                            className="mt-2 text-blue-600 hover:text-blue-800 underline"
                        >
                            View Full Debug Info
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Main Render =====
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manajemen Pasien
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {roleNames.includes(UserRole.DOKTER)
                            ? 'Daftar pasien yang ditugaskan kepada Anda'
                            : 'Kelola data pasien klinik'}
                    </p>
                </div>
            </div>

            {/* Patient List Component */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <PatientList
                    user_id={user.id}
                    role_id={user.roles?.[0]?.name}
                    patients={patients}                // 🔥 Tambahkan ini
                    totalItems={totalItems}            // 🔥 Jika tabel butuh pagination
                    loading={loading}                  // Opsional: bisa dikirim untuk skeleton
                    onView={handleViewPatient}
                    onEdit={
                        canUpdatePatient ||
                            roleNames.includes(UserRole.STAF) ||
                            roleNames.includes(UserRole.KEPALA_KLINIK)
                            ? handleEditPatient
                            : undefined
                    }
                    onAdd={
                        canCreatePatient ||
                            roleNames.includes(UserRole.STAF) ||
                            roleNames.includes(UserRole.KEPALA_KLINIK)
                            ? handleAddPatient
                            : undefined
                    }
                />
            )}
        </div>
    );
}