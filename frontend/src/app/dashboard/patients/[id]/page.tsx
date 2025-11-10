'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';
import { PatientProfile } from '@/components/features/patients/PatientProfile';
import { Can } from '@/components/auth/Can';
import { useToastStore } from '@/lib/store/toastStore';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import * as patientService from '@/lib/api';

/**
 * Halaman Detail Pasien dengan RBAC
 * 
 * Role Access:
 * - Kepala Klinik: View + Edit + Delete
 * - Staf: View + Edit
 * - Dokter: View only (jika pasien ditugaskan)
 */
export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = Number(params.id);

    const { user, loading: authLoading } = useAuth();
    const { can } = usePermission();
    const { success, error } = useToastStore();
    const { confirmDelete } = useConfirm();

    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    // ===== RBAC Permissions =====
    const canUpdate = can(Permission.UPDATE_PATIENT);
    const canDelete = can(Permission.DELETE_PATIENT);

    // ===== Check Access =====
    useEffect(() => {
        const checkAccess = async () => {
            if (!user || isNaN(patientId)) {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            try {
                // Dokter: Check if patient is assigned to them
                const isDokter = user.roles.some(r => r.name === 'dokter');

                if (isDokter) {
                    // Check if patient has appointments with this doctor
                    const patient = await patientService.getPatientById(patientId);
                    const hasAppointment = patient.appointments?.some(
                        apt => apt.doctor_id === user.id
                    );
                    setHasAccess(hasAppointment || false);
                } else {
                    // Kepala Klinik & Staf: Full access
                    setHasAccess(true);
                }
            } catch (err: any) {
                error(err.message || 'Gagal memeriksa akses');
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            checkAccess();
        }
    }, [user, authLoading, patientId]);

    // ===== Handlers =====
    const handleEdit = () => {
        router.push(`/dashboard/patients/${patientId}/edit`);
    };

    const handleDelete = async () => {
        await confirmDelete(`pasien ini`, async () => {
            try {
                await patientService.deletePatient(patientId);
                success('Pasien berhasil dihapus');
                router.push('/dashboard/patients');
            } catch (err: any) {
                error(err.message || 'Gagal menghapus pasien');
            }
        });
    };

    const handleBack = () => {
        router.push('/dashboard/patients');
    };

    // ===== Loading State =====
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ===== Access Denied =====
    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Akses Ditolak
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Anda tidak memiliki izin untuk melihat data pasien ini.
                    </p>
                    <button
                        onClick={handleBack}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Kembali ke Daftar Pasien
                    </button>
                </div>
            </div>
        );
    }

    // ===== Main Render =====
    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                </button>

                <div className="flex items-center gap-3">
                    {/* Edit Button (RBAC) */}
                    <Can permission={Permission.UPDATE_PATIENT}>
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Edit className="w-5 h-5" />
                            <span>Edit</span>
                        </button>
                    </Can>

                    {/* Delete Button (RBAC) */}
                    <Can permission={Permission.DELETE_PATIENT}>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>Hapus</span>
                        </button>
                    </Can>
                </div>
            </div>

            {/* Patient Profile Component */}
            <PatientProfile
                patientId={patientId}
                onEdit={canUpdate ? handleEdit : undefined}
            />
        </div>
    );
}