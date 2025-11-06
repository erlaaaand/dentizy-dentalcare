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

    // Fetch patients
    const fetchPatients = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(searchQuery && { search: searchQuery })
            };

            const data = searchQuery 
                ? await searchPatients(params)
                : await getAllPatients(params);

            setPatients(data.data || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0
            }));
        } catch (err) {
            setError('Gagal memuat data pasien.');
            console.error('Error fetching patients:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPatients();
    }, [pagination.page, pagination.limit]);

    // Search dengan debounce
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 })); // Reset ke halaman 1
            fetchPatients();
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [searchQuery]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getGenderLabel = (gender?: 'L' | 'P') => {
        if (!gender) return '-';
        return gender === 'L' ? 'Laki-laki' : 'Perempuan';
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getRowNumber = (index: number) => {
        return (pagination.page - 1) * pagination.limit + index + 1;
    };

    if (isLoading && patients.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat data pasien...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
                {error}
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <span className="text-sm text-gray-600">
                    Total: {pagination.total} pasien
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {patients.length === 0 ? (
                    <div className="text-gray-500 p-8 text-center">
                        {searchQuery 
                            ? `Tidak ada pasien ditemukan dengan kata kunci "${searchQuery}"`
                            : 'Tidak ada data pasien ditemukan'
                        }
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
                                Menampilkan {getRowNumber(0)} - {getRowNumber(patients.length - 1)} dari {pagination.total} data
                            </span>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => handlePageChange(pagination.page - 1)} 
                                    disabled={pagination.page <= 1 || isLoading} 
                                    className="px-3 py-1 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Sebelumnya
                                </button>
                                
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                                    Halaman {pagination.page} dari {pagination.totalPages}
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