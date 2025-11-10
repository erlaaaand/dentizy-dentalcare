// frontend/src/components/features/patients/PatientList.tsx
'use client';

import React, { useState } from 'react';
import { Patient } from '@/types/api';
import { usePatients } from '@/contexts/PatientContext';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { usePagination } from '@/lib/hooks';
import { formatDate, formatAge, formatPhoneNumber } from '@/lib/formatters';
import { Search, Plus, Edit, Trash2, Eye, Phone, Mail, Filter, X } from 'lucide-react';
import Table, { Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

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
        filters,
        setCurrentPage,
        setSearchQuery,
        setFilters,
        resetFilters,
        deletePatient
    } = usePatients();

    const { confirmDelete } = useConfirm();
    const { totalPages } = usePagination({ totalItems, itemsPerPage: 10 });

    const [showFilter, setShowFilter] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleDelete = async (patient: Patient) => {
        await confirmDelete(`pasien "${patient.nama_lengkap}"`, async () => {
            await deletePatient(patient.id);
        });
    };

    const handleApplyFilter = () => {
        setFilters(localFilters);
        setShowFilter(false);
    };

    const handleResetFilter = () => {
        const emptyFilters = {
            jenis_kelamin: '' as '',
            umur_min: undefined,
            umur_max: undefined,
            tanggal_daftar_dari: '',
            tanggal_daftar_sampai: '',
        };
        setLocalFilters(emptyFilters);
        resetFilters();
        setShowFilter(false);
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

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
            {/* Header dengan Search & Filter */}
            <div className="flex items-center gap-3">
                {/* Instant Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama, NIK, No. RM..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Filter className="w-5 h-5" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Add Button */}
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

            {/* Filter Panel */}
            {showFilter && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Jenis Kelamin */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={localFilters.jenis_kelamin || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        jenis_kelamin: e.target.value as any
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Semua</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            {/* Umur Min */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Umur Minimal
                                </label>
                                <input
                                    type="number"
                                    value={localFilters.umur_min || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        umur_min: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Umur Max */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Umur Maksimal
                                </label>
                                <input
                                    type="number"
                                    value={localFilters.umur_max || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        umur_max: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                    placeholder="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Tanggal Daftar Dari */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Daftar Dari
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.tanggal_daftar_dari || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        tanggal_daftar_dari: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Tanggal Daftar Sampai */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Daftar Sampai
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.tanggal_daftar_sampai || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        tanggal_daftar_sampai: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2 border-t">
                            <button
                                onClick={handleApplyFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                onClick={handleResetFilter}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowFilter(false)}
                                className="ml-auto text-gray-600 hover:text-gray-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Info */}
            {(searchQuery || activeFilterCount > 0) && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    {searchQuery && (
                        <span>
                            Hasil pencarian: <strong>"{searchQuery}"</strong>
                        </span>
                    )}
                    {activeFilterCount > 0 && (
                        <span className="flex items-center gap-1">
                            <Filter className="w-4 h-4" />
                            {activeFilterCount} filter aktif
                        </span>
                    )}
                    {totalItems > 0 && <span>- {totalItems} pasien ditemukan</span>}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <Table
                    data={patients}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={
                        searchQuery || activeFilterCount > 0
                            ? 'Tidak ada pasien yang ditemukan'
                            : 'Belum ada data pasien'
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