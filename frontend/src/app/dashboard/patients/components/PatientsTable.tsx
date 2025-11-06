'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import { getAllPatients, searchPatients } from '@/lib/api/patientService';

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
    created_at?: string;
    updated_at?: string;
};

type PatientsTableProps = {
    onDetailClick?: (patient: Patient) => void;
};

export default function PatientsTable({ onDetailClick }: PatientsTableProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // ✅ FIXED: Fetch patients dengan error handling yang lebih baik
    const fetchPatients = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(searchQuery && { search: searchQuery })
            };

            const response = searchQuery 
                ? await searchPatients(params)
                : await getAllPatients(params);

            // ✅ FIXED: Validasi response structure
            if (!response) {
                throw new Error('Invalid response from server');
            }

            const patientData = response.data || [];
            const paginationData = response.pagination || {};

            setPatients(Array.isArray(patientData) ? patientData : []);
            setPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (err: any) {
            const errorMessage = err.message || 'Gagal memuat data pasien.';
            setError(errorMessage);
            setPatients([]);
            console.error('Error fetching patients:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPatients();
    }, [pagination.page, pagination.limit]);

    // ✅ FIXED: Search dengan debounce yang lebih baik
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            if (pagination.page !== 1) {
                setPagination(prev => ({ ...prev, page: 1 }));
            } else {
                fetchPatients();
            }
        }, 500);

        setSearchTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [searchQuery]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            
            return date.toLocaleDateString('id-ID', {
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

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getRowNumber = (index: number) => {
        return (pagination.page - 1) * pagination.limit + index + 1;
    };

    // ✅ FIXED: Loading state yang lebih informatif
    if (isLoading && patients.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <span className="text-gray-600 font-medium">Memuat data pasien...</span>
                <span className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</span>
            </div>
        );
    }

    // ✅ FIXED: Error state dengan retry option
    if (error && patients.length === 0) {
        return (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <div className="flex flex-col items-center gap-4">
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-red-800 font-semibold mb-1">{error}</p>
                        <p className="text-red-600 text-sm">Silakan coba lagi atau hubungi administrator jika masalah berlanjut.</p>
                    </div>
                    <button
                        onClick={fetchPatients}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari pasien (nama, NIK, no. rekam medis, email)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {isLoading && searchQuery && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Total: <span className="font-semibold">{pagination.total}</span> pasien
                    </span>
                </div>
            </div>

            {/* Error Banner (if error but still has data) */}
            {error && patients.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {patients.length === 0 ? (
                    <div className="text-center p-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'Tidak ada pasien ditemukan' : 'Belum ada data pasien'}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery 
                                ? `Tidak ada pasien yang cocok dengan pencarian "${searchQuery}"`
                                : 'Silakan tambahkan pasien baru untuk memulai'
                            }
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Hapus pencarian
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No. Rekam Medis
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Lengkap
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NIK
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jenis Kelamin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Lahir
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No. Telepon
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients.map((patient, index) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getRowNumber(index)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                                    {patient.nomor_rekam_medis}
                                                </div>
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

                        {/* Pagination */}
                        <div className="p-4 flex justify-between items-center border-t border-gray-200">
                            <span className="text-sm text-gray-700">
                                Menampilkan{' '}
                                <span className="font-medium">{getRowNumber(0)}</span> -{' '}
                                <span className="font-medium">{getRowNumber(patients.length - 1)}</span> dari{' '}
                                <span className="font-medium">{pagination.total}</span> data
                            </span>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => handlePageChange(pagination.page - 1)} 
                                    disabled={pagination.page <= 1 || isLoading} 
                                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Sebelumnya
                                </button>
                                
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg font-medium">
                                    Halaman {pagination.page} dari {pagination.totalPages || 1}
                                </span>
                                
                                <button 
                                    onClick={() => handlePageChange(pagination.page + 1)} 
                                    disabled={pagination.page >= pagination.totalPages || isLoading} 
                                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}