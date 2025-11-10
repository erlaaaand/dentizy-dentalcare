// frontend/src/hooks/usePatientDetail.ts
'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/types/api';
import * as patientService from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useAuth } from '@/lib/hooks/useAuth';

interface UsePatientDetailOptions {
    patientId: number;
    checkAccess?: boolean;
}

export function usePatientDetail({ patientId, checkAccess = false }: UsePatientDetailOptions) {
    const { user } = useAuth();
    const { error } = useToastStore();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        loadPatient();
    }, [patientId]);

    const loadPatient = async () => {
        if (isNaN(patientId)) {
            error('ID pasien tidak valid');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await patientService.getPatientById(patientId);
            setPatient(data);

            // Check access for doctors
            if (checkAccess && user) {
                const isDokter = user.roles.some(r => r.name === 'dokter');
                if (isDokter) {
                    const hasAppointment = data.appointments?.some(
                        apt => apt.doctor_id === user.id
                    );
                    setHasAccess(hasAppointment || false);
                } else {
                    // Kepala Klinik & Staf have full access
                    setHasAccess(true);
                }
            } else {
                setHasAccess(true);
            }
        } catch (err: any) {
            error(err.message || 'Gagal memuat data pasien');
            setPatient(null);
            setHasAccess(false);
        } finally {
            setLoading(false);
        }
    };

    const refreshPatient = async () => {
        await loadPatient();
    };

    return {
        patient,
        loading,
        hasAccess,
        refreshPatient,
    };
}