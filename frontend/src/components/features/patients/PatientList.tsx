// frontend/src/components/features/patients/PatientList.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Patient } from '@/types/api';
import { usePatients } from '@/contexts/PatientContext';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { usePagination } from '@/lib/hooks';
import { formatDate, formatAge, formatPhoneNumber } from '@/lib/formatters';
import { Search, Plus, Edit, Trash2, Eye, Phone, Mail, X } from 'lucide-react';
import Table, { Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';

interface PatientListProps {
    onEdit?: (patient: Patient) => void;
    onView?: (patient: Patient) => void;
    onAdd?: () => void;
}

export function PatientList({ onEdit, onView, onAdd }: PatientListProps) {
    const {
        patients,
        loading,
        totalItems,
        currentPage,
        searchQuery,
        setCurrentPage,
        setSearchQuery,
        deletePatient
    } = usePatients();

    const { confirmDelete } = useConfirm();
    const { totalPages } = usePagination({ totalItems, itemsPerPage: 10 });

    const handleDelete = async (patient: Patient) => {
        await confirmDelete(`pasien "${patient.nama_lengkap}"`, async () => {
            await deletePatient(patient.id);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Mencegah form submission saat Enter
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

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
                    <div className="text-sm font-medium text-gray-900">{patient.nama_lengkap}</div>
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
                <span className="text-sm text-gray-900">{formatAge(patient.tanggal_lahir)}</span>
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
                            <span className="truncate max-w-[200px]" title={patient.email}>
                                {patient.email}
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            header: 'Terdaftar',
            render: (patient) => (
                <span className="text-sm text-gray-500">{formatDate(patient.created_at)}</span>
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
                            type="button"
                            onClick={() => onView(patient)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Lihat detail"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(patient)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="button"
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

    const startIndex = (currentPage - 1) * 10;
    const endIndex = Math.min(currentPage * 10, totalItems);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery} // Langsung panggil setSearchQuery
                    placeholder="Cari berdasarkan nama, NIK, No. RM..."
                    debounceMs={500} // Atur debounce di sini
                    className="w-full"
                />

                {/* Tampilkan 'loading' hanya jika sedang mencari (ada query) */}
                {loading && searchQuery && (
                    <p className="mt-1 text-xs text-gray-500">Mencari...</p>
                )}

                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Pasien</span>
                    </button>
                )}
            </div>

            {/* Search Info */}
            {searchQuery && (
                <div className="text-sm text-gray-600">
                    Menampilkan hasil pencarian untuk: <strong>"{searchQuery}"</strong>
                    {totalItems > 0 && ` - ${totalItems} pasien ditemukan`}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <Table
                    data={patients}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={
                        searchQuery ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'
                    }
                    hoverable={true}
                />

                {!loading && patients.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
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