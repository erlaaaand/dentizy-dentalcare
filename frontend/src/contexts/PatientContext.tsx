'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Patient, UserRole } from '@/types/api';
import * as patientService from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useAuth } from '@/lib/hooks/useAuth';

interface PatientFilters {
    jenis_kelamin?: 'L' | 'P' | '';
    umur_min?: number;
    umur_max?: number;
    tanggal_daftar_dari?: string;
    tanggal_daftar_sampai?: string;
}

interface PatientContextValue {
    patients: Patient[];
    loading: boolean;
    totalItems: number;
    currentPage: number;
    searchQuery: string;
    filters: PatientFilters;
    loadPatients: () => Promise<void>;
    setCurrentPage: (page: number) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: PatientFilters) => void;
    resetFilters: () => void;
    deletePatient: (patientId: number) => Promise<void>;
    refreshPatients: () => Promise<void>;
    canViewAllPatients: boolean;
    isDokter: boolean;
}

const PatientContext = createContext<PatientContextValue | null>(null);

const DEFAULT_FILTERS: PatientFilters = {
    jenis_kelamin: '',
    umur_min: undefined,
    umur_max: undefined,
    tanggal_daftar_dari: '',
    tanggal_daftar_sampai: '',
};

export function PatientProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const { error, success } = useToastStore();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQueryState] = useState('');
    const [filters, setFiltersState] = useState<PatientFilters>(DEFAULT_FILTERS);

    // Ref untuk cancel previous request
    const abortControllerRef = useRef<AbortController | null>(null);

    const roleNames = Array.isArray(user?.roles)
        ? user!.roles.map((r) => r.name)
        : [];

    const isDokter = roleNames.includes(UserRole.DOKTER);
    const canViewAllPatients =
        roleNames.includes(UserRole.KEPALA_KLINIK) ||
        roleNames.includes(UserRole.STAF);

    // Custom setter untuk search dengan instant reset page
    const setSearchQuery = useCallback((query: string) => {
        setSearchQueryState(query);
        setCurrentPage(1); // Reset ke halaman 1
    }, []);

    // Custom setter untuk filters
    const setFilters = useCallback((newFilters: PatientFilters) => {
        setFiltersState(newFilters);
        setCurrentPage(1); // Reset ke halaman 1
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        setCurrentPage(1);
    }, []);

    const loadPatients = useCallback(async () => {
        if (!user) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);
        try {
            // Build params
            const params: any = {
                page: currentPage,
                limit: 10,
                search: searchQuery || undefined,
            };

            // Add filters
            if (filters.jenis_kelamin) {
                params.jenis_kelamin = filters.jenis_kelamin;
            }
            if (filters.umur_min) {
                params.umur_min = filters.umur_min;
            }
            if (filters.umur_max) {
                params.umur_max = filters.umur_max;
            }
            if (filters.tanggal_daftar_dari) {
                params.tanggal_daftar_dari = filters.tanggal_daftar_dari;
            }
            if (filters.tanggal_daftar_sampai) {
                params.tanggal_daftar_sampai = filters.tanggal_daftar_sampai;
            }

            let response;
            if (isDokter) {
                response = await patientService.getPatientsByDoctor({
                    doctor_id: user.id,
                    ...params,
                });
            } else {
                response = await patientService.getAllPatients(params);
            }

            // Check if request was aborted
            if (abortController.signal.aborted) {
                return;
            }

            setPatients(response.data);
            setTotalItems(response.pagination.total);
        } catch (err: any) {
            // Ignore abort errors
            if (err.name === 'AbortError' || abortController.signal.aborted) {
                return;
            }
            error(err.message || 'Gagal memuat data pasien');
            setPatients([]);
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [user, isDokter, currentPage, searchQuery, filters, error]);

    // Effect untuk auto-load dengan instant response
    useEffect(() => {
        if (user) {
            loadPatients();
        }

        // Cleanup: abort on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [user, currentPage, searchQuery, filters, loadPatients]);

    const deletePatient = useCallback(async (patientId: number) => {
        try {
            await patientService.deletePatient(patientId);
            success('Pasien berhasil dihapus');
            await loadPatients();
        } catch (err: any) {
            error(err.message || 'Gagal menghapus pasien');
            throw err;
        }
    }, [loadPatients, success, error]);

    const refreshPatients = useCallback(async () => {
        await loadPatients();
    }, [loadPatients]);

    const value: PatientContextValue = {
        patients,
        loading,
        totalItems,
        currentPage,
        searchQuery,
        filters,
        loadPatients,
        setCurrentPage,
        setSearchQuery,
        setFilters,
        resetFilters,
        deletePatient,
        refreshPatients,
        canViewAllPatients,
        isDokter,
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Memuat data user...</div>
            </div>
        );
    }

    if (!user) {
        return <>{children}</>;
    }

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
}

export function usePatients() {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatients must be used within PatientProvider');
    }
    return context;
}