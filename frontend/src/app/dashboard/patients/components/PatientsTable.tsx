'use client';

import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { getAllPatients, searchPatients } from '@/lib/api/patientService';

// ✅ Import Custom Hooks
import { useDebounce, useAsync, usePagination } from '@/lib/hooks';

// ✅ Import UI Components
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';

type Patient = {
    id: number;
    nomor_rekam_medis: string;
    nama_lengkap: string;
    nik?: string;
    alamat?: string;
    tanggal_lahir?: string;
    no_hp?: string;
    jenis_kelamin?: 'L' | 'P';
    email?: string;
};

type PatientsTableProps = {
    onDetailClick?: (patient: Patient) => void;
};

export default function PatientsTableRefactored({ onDetailClick }: PatientsTableProps) {
    // ✅ 1. SEARCH dengan useDebounce
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500);

    // ✅ 2. PAGINATION dengan usePagination
    const {
        currentPage,
        totalPages,
        itemsPerPage,
        startIndex,
        endIndex,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        setItemsPerPage
    } = usePagination({
        totalItems: 0, // Will be updated from API
        itemsPerPage: 10,
        initialPage: 1
    });

    // ✅ 3. ASYNC DATA FETCHING dengan useAsync
    const { 
        data: patientsData, 
        loading, 
        error, 
        execute: fetchPatients 
    } = useAsync(async () => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            ...(debouncedQuery && { search: debouncedQuery })
        };

        return debouncedQuery 
            ? await searchPatients(params)
            : await getAllPatients(params);
    }, false); // Don't auto-execute

    // Fetch data when dependencies change
    useEffect(() => {
        fetchPatients();
    }, [currentPage, itemsPerPage, debouncedQuery]);

    // Extract patients and pagination data
    const patients = patientsData?.data || [];
    const totalItems = patientsData?.pagination?.total || 0;

    // Update pagination total
    useEffect(() => {
        if (totalItems > 0) {
            // This would ideally be handled by usePagination internally
            // For now, we recalculate totalPages manually
        }
    }, [totalItems]);

    // ✅ 4. UTILITY FUNCTIONS
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    const getGenderLabel = (gender?: 'L' | 'P') => {
        if (!gender) return '-';
        return gender === 'L' ? 'Laki-laki' : 'Perempuan';
    };

    const getRowNumber = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
    };

    // ✅ 5. RENDER STATES

    // Loading State
    if (loading && patients.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg">
                <LoadingSpinner size="lg" />
                <span className="text-gray-600 font-medium mt-4">Memuat data pasien...</span>
            </div>
        );
    }

    // Error State
    if (error && patients.length === 0) {
        return (
            <ErrorMessage 
                message={error.message || 'Gagal memuat data pasien'}
                onRetry={fetchPatients}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* ✅ SEARCH BAR dengan SearchInput Component */}
            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Cari pasien (nama, NIK, no. rekam medis, email)..."
                    className="flex-1"
                />
                
                <Badge variant="info">
                    Total: {totalItems} pasien
                </Badge>
            </div>

            {/* Error Banner (if error but still has data) */}
            {error && patients.length > 0 && (
                <ErrorMessage message={error.message} />
            )}

            {/* ✅ TABLE atau EMPTY STATE */}
            {patients.length === 0 ? (
                <EmptyState
                    icon={
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    title={searchQuery ? 'Tidak ada pasien ditemukan' : 'Belum ada data pasien'}
                    description={
                        searchQuery 
                            ? `Tidak ada pasien yang cocok dengan pencarian "${searchQuery}"`
                            : 'Silakan tambahkan pasien baru untuk memulai'
                    }
                    action={
                        searchQuery ? (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Hapus pencarian
                            </button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rekam Medis</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telepon</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patients.map((patient, index) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getRowNumber(index)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="default">
                                                {patient.nomor_rekam_medis}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {patient.nama_lengkap}
                                            </div>
                                            {patient.email && (
                                                <div className="text-sm text-gray-500">
                                                    {patient.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {patient.nik || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getGenderLabel(patient.jenis_kelamin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(patient.tanggal_lahir)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {patient.no_hp || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => onDetailClick?.(patient)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ PAGINATION dengan Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        onPageChange={goToPage}
                        showInfo
                        startIndex={startIndex}
                        endIndex={Math.min(endIndex, totalItems)}
                        totalItems={totalItems}
                    />
                </div>
            )}
        </div>
    );
}