'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, UserRole } from '@/types/api';
import * as patientService from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useAuth } from '@/lib/hooks/useAuth';

interface PatientContextValue {
    patients: Patient[];
    loading: boolean;
    totalItems: number;
    currentPage: number;
    searchQuery: string;
    loadPatients: () => Promise<void>;
    setCurrentPage: (page: number) => void;
    setSearchQuery: (query: string) => void;
    deletePatient: (patientId: number) => Promise<void>;
    refreshPatients: () => Promise<void>;
    canViewAllPatients: boolean;
    isDokter: boolean;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const { error, success } = useToastStore();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Tetap jalankan semua hook dulu
    const roleNames = Array.isArray(user?.roles)
        ? user!.roles.map((r) => r.name)
        : [];

    console.log('🧠 DEBUG ROLE CHECK:', {
        user,
        roles: user?.roles,
        extractedRoleNames: roleNames,
    });

    const isDokter = roleNames.includes(UserRole.DOKTER);
    const canViewAllPatients =
        roleNames.includes(UserRole.KEPALA_KLINIK) ||
        roleNames.includes(UserRole.STAF);

    // --- PERBAIKAN DIMULAI DI SINI ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, _setSearchQuery] = useState(''); // Diganti nama

    // Buat fungsi 'setter' kustom untuk setSearchQuery
    const setSearchQuery = (query: string) => {
        // Hanya jalankan jika query benar-benar berubah
        if (query !== searchQuery) {
            _setSearchQuery(query);
            setCurrentPage(1); // INI KUNCINYA: Reset halaman ke 1
        }
    };
    // --- PERBAIKAN SELESAI ---

    const loadPatients = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            let response;
            if (isDokter) {
                response = await patientService.getPatientsByDoctor({
                    doctor_id: user.id,
                    page: currentPage,
                    limit: 10,
                    search: searchQuery || undefined,
                });
            } else {
                response = await patientService.getAllPatients({
                    page: currentPage,
                    limit: 10,
                    search: searchQuery || undefined,
                });
            }
            setPatients(response.data);
            setTotalItems(response.pagination.total);
        } catch (err: any) {
            error(err.message || 'Gagal memuat data pasien');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [user, isDokter, currentPage, searchQuery]);

    useEffect(() => {
        if (user) loadPatients();
    }, [user, currentPage, searchQuery, loadPatients]);

    const deletePatient = useCallback(async (patientId: number) => {
        try {
            await patientService.deletePatient(patientId);
            success('Pasien berhasil dihapus');
            await loadPatients();
        } catch (err: any) {
            error(err.message || 'Gagal menghapus pasien');
            throw err;
        }
    }, [loadPatients]);

    const refreshPatients = useCallback(async () => {
        await loadPatients();
    }, [loadPatients]);

    const value: PatientContextValue = {
        patients,
        loading,
        totalItems,
        currentPage,
        searchQuery,
        loadPatients,
        setCurrentPage, // Ini masih setter 'useState' yang asli
        setSearchQuery, // Ini sekarang adalah fungsi kustom kita
        deletePatient,
        refreshPatients,
        canViewAllPatients,
        isDokter,
    };

    // 🧩 Tampilkan skeleton saat auth belum siap
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Memuat data user...</div>
            </div>
        );
    }

    // Baru di sini lakukan render bersyarat
    if (!user) {
        console.log('⏳ User belum siap di PatientContext');
        return <>{children}</>; // tetap aman, hook sudah dipanggil semua
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