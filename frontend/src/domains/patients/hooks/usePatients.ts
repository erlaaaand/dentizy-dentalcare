import { useCallback, useEffect, useRef } from 'react';
import { usePatientsStore } from '@stores/patients.store';
import { useAuth } from '@domains/auth/hooks/useAuth';
import { useToast } from '@hooks/ui/useToast';
import { patientService } from '../services/patientService';
import { sanitizeString, sanitizeFilters, validateSortConfig } from '../utils/security.utils';

export const usePatients = () => {
    const {
        patients, loading, totalItems, currentPage, searchQuery, filters, sortConfig,
        setPatients, setLoading, setTotalItems, setCurrentPage, setSearchQuery,
        setFilters, setSortConfig, resetFilters
    } = usePatientsStore();

    const { user } = useAuth();
    const { showToast } = useToast();

    const abortControllerRef = useRef<AbortController | null>(null);

    // Permission logic
    const roleNames = Array.isArray(user?.roles)
        ? user!.roles.map((r) => r.name)
        : [];

    const isDokter = roleNames.includes('DOKTER');
    const canViewAllPatients = roleNames.includes('KEPALA_KLINIK') || roleNames.includes('STAF');

    // Secure setters
    const secureSetSearchQuery = useCallback((query: string) => {
        const sanitized = sanitizeString(query);
        setSearchQuery(sanitized);
        setCurrentPage(1);
    }, [setSearchQuery, setCurrentPage]);

    const secureSetFilters = useCallback((newFilters: any) => {
        const sanitized = sanitizeFilters(newFilters);
        setFilters(sanitized);
        setCurrentPage(1);
    }, [setFilters, setCurrentPage]);

    const secureSetSortConfig = useCallback((config: any) => {
        if (config && validateSortConfig(config)) {
            setSortConfig(config);
            setCurrentPage(1);
        }
    }, [setSortConfig, setCurrentPage]);

    // Data fetching
    const loadPatients = useCallback(async () => {
        if (!user) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);

        try {
            const params: any = {
                page: Math.max(1, currentPage),
                limit: 10,
            };

            if (searchQuery) {
                params.search = sanitizeString(searchQuery);
            }

            const sanitizedFilters = sanitizeFilters(filters);
            Object.assign(params, sanitizedFilters);

            if (sortConfig) {
                params.sort_by = sortConfig.field;
                params.sort_order = sortConfig.direction;
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

            if (abortController.signal.aborted) return;

            if (response && Array.isArray(response.data)) {
                setPatients(response.data);
                setTotalItems(response.pagination?.total || 0);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            if (err.name === 'AbortError' || abortController.signal.aborted) return;

            console.error('Load patients error:', err);
            showToast(err.message || 'Gagal memuat data pasien', 'error');
            setPatients([]);
            setTotalItems(0);
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [
        user, isDokter, currentPage, searchQuery, filters, sortConfig,
        setLoading, setPatients, setTotalItems, showToast
    ]);

    // Actions
    const deletePatient = useCallback(async (patientId: number) => {
        try {
            if (!patientId || patientId <= 0) {
                throw new Error('Invalid patient ID');
            }

            await patientService.deletePatient(patientId);
            showToast('Pasien berhasil dihapus', 'success');
            await loadPatients();
        } catch (err: any) {
            showToast(err.message || 'Gagal menghapus pasien', 'error');
            throw err;
        }
    }, [loadPatients, showToast]);

    const refreshPatients = useCallback(async () => {
        await loadPatients();
    }, [loadPatients]);

    // Auto-load effect
    useEffect(() => {
        if (user) {
            loadPatients();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [user, currentPage, searchQuery, filters, sortConfig, loadPatients]);

    return {
        // State
        patients,
        loading,
        totalItems,
        currentPage,
        searchQuery,
        filters,
        sortConfig,

        // Actions
        loadPatients,
        setCurrentPage,
        setSearchQuery: secureSetSearchQuery,
        setFilters: secureSetFilters,
        setSortConfig: secureSetSortConfig,
        resetFilters,
        deletePatient,
        refreshPatients,

        // Permissions
        canViewAllPatients,
        isDokter,
    };
};