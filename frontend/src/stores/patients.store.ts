import { create } from 'zustand';
import { Patient } from '@domains/patients/types/patient.types';

interface PatientFilters {
    jenis_kelamin?: 'L' | 'P' | '';
    umur_min?: number;
    umur_max?: number;
    tanggal_daftar_dari?: string;
    tanggal_daftar_sampai?: string;
}

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

interface PatientState {
    // State
    patients: Patient[];
    loading: boolean;
    totalItems: number;
    currentPage: number;
    searchQuery: string;
    filters: PatientFilters;
    sortConfig: SortConfig | null;

    // Actions
    setPatients: (patients: Patient[]) => void;
    setLoading: (loading: boolean) => void;
    setTotalItems: (totalItems: number) => void;
    setCurrentPage: (page: number) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: PatientFilters) => void;
    setSortConfig: (config: SortConfig | null) => void;
    resetFilters: () => void;
}

export const usePatientsStore = create<PatientState>((set) => ({
    // Initial state
    patients: [],
    loading: false,
    totalItems: 0,
    currentPage: 1,
    searchQuery: '',
    filters: {
        jenis_kelamin: '',
        umur_min: undefined,
        umur_max: undefined,
        tanggal_daftar_dari: '',
        tanggal_daftar_sampai: '',
    },
    sortConfig: null,

    // Actions
    setPatients: (patients) => set({ patients }),
    setLoading: (loading) => set({ loading }),
    setTotalItems: (totalItems) => set({ totalItems }),
    setCurrentPage: (currentPage) => set({ currentPage }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFilters: (filters) => set({ filters }),
    setSortConfig: (sortConfig) => set({ sortConfig }),
    resetFilters: () => set({
        filters: {
            jenis_kelamin: '',
            umur_min: undefined,
            umur_max: undefined,
            tanggal_daftar_dari: '',
            tanggal_daftar_sampai: '',
        },
        sortConfig: null,
        currentPage: 1
    }),
}));