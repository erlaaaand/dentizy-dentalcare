'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '@/types/api';
import * as patienService from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useDebounce, usePagination } from '@/lib/hooks';
import { formatDate, formatAge, formatPhoneNumber } from '@/lib/formatters';
import { Search, Plus, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import Table, { Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

interface PatientListProps {
    onEdit?: (patient: Patient) => void;
    onView?: (patient: Patient) => void;
    onAdd?: () => void;
}

export function PatientList({ onEdit, onView, onAdd }: PatientListProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { success, error } = useToastStore();
    const { confirmDelete } = useConfirm();

    const [totalItems, setTotalItems] = useState(0);
    const {
        currentPage,
        itemsPerPage,
        goToPage,
        totalPages,
    } = usePagination({ totalItems, itemsPerPage: 10 });

    useEffect(() => {
        loadPatients();
    }, [currentPage, debouncedSearch]);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await patienService.getAllPatients({
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch || undefined,
            });

            setPatients(response.data);
            setTotalItems(response.pagination.total);
        } catch (err: any) {
            error(err.message || 'Gagal memuat data pasien');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (patient: Patient) => {
        const confirmed = await confirmDelete(
            `pasien "${patient.nama_lengkap}"`,
            async () => {
                try {
                    await patienService.deletePatient(patient.id);
                    success('Pasien berhasil dihapus');
                    loadPatients();
                } catch (err: any) {
                    error(err.message || 'Gagal menghapus pasien');
                }
            }
        );
    };

    // Define table columns
    const columns: Column<Patient>[] = [
        {
            key: 'nomor_rekam_medis',
            header: 'No. RM',
            render: (patient) => (
                <span className="text-sm font-medium text-gray-900">
                    {patient.nomor_rekam_medis}
                </span>
            ),
        },
        {
            key: 'nama_lengkap',
            header: 'Nama Pasien',
            render: (patient) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {patient.nama_lengkap}
                    </div>
                    {patient.jenis_kelamin && (
                        <div className="text-sm text-gray-500">
                            {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'tanggal_lahir',
            header: 'Umur',
            render: (patient) => (
                <span className="text-sm text-gray-900">
                    {formatAge(patient.tanggal_lahir)}
                </span>
            ),
        },
        {
            key: 'kontak',
            header: 'Kontak',
            render: (patient) => (
                <div className="space-y-1">
                    {patient.no_hp && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{formatPhoneNumber(patient.no_hp)}</span>
                        </div>
                    )}
                    {patient.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{patient.email}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            header: 'Terdaftar',
            render: (patient) => (
                <span className="text-sm text-gray-500">
                    {formatDate(patient.created_at)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            className: 'text-right',
            render: (patient) => (
                <div className="flex items-center justify-end gap-2">
                    {onView && (
                        <button
                            onClick={() => onView(patient)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Lihat detail"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(patient)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    // Calculate pagination info
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pasien..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Pasien</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <Table
                    data={patients}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={
                        searchQuery
                            ? 'Tidak ada pasien yang ditemukan'
                            : 'Belum ada data pasien'
                    }
                    hoverable={true}
                />

                {/* Pagination */}
                {!loading && patients.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        showInfo={true}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalItems={totalItems}
                    />
                )}
            </div>
        </div>
    );
}