// frontend/src/components/features/patients/PatientList.tsx
'use client';

import React, { useState } from 'react';
import { Patient } from '@/core/types/api';
import { usePatients } from '@/contexts/PatientContext';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { usePagination } from '@/lib/hooks';
import { formatDate, formatAge, formatPhoneNumber } from '@/core/formatters';
import {
    Search, Plus, Edit, Trash2, Eye, Phone, Mail, Filter, X,
    ArrowUpDown, ArrowUp, ArrowDown, Calendar, User
} from 'lucide-react';
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
        sortConfig,
        setCurrentPage,
        setSearchQuery,
        setFilters,
        setSortConfig,
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

    const handleSort = (field: string) => {
        if (sortConfig?.field === field) {
            if (sortConfig.direction === 'asc') {
                setSortConfig({ field, direction: 'desc' });
            } else {
                setSortConfig(null); // Reset sort
            }
        } else {
            setSortConfig({ field, direction: 'asc' });
        }
    };

    const getSortIcon = (field: string) => {
        if (sortConfig?.field !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 text-blue-600" />
            : <ArrowDown className="w-4 h-4 text-blue-600" />;
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

    const columns: Column<Patient>[] = [
        {
            key: 'nomor_rekam_medis',
            header: (
                <button
                    onClick={() => handleSort('nomor_rekam_medis')}
                    className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors"
                >
                    <span>No. RM</span>
                    {getSortIcon('nomor_rekam_medis')}
                </button>
            ) as any,
            render: (patient) => (
                <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">
                    {patient.nomor_rekam_medis}
                </span>
            ),
        },
        {
            key: 'nama_lengkap',
            header: (
                <button
                    onClick={() => handleSort('nama_lengkap')}
                    className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors"
                >
                    <span>Nama Pasien</span>
                    {getSortIcon('nama_lengkap')}
                </button>
            ) as any,
            render: (patient) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {patient.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{patient.nama_lengkap}</div>
                        {patient.jenis_kelamin && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'tanggal_lahir',
            header: (
                <button
                    onClick={() => handleSort('tanggal_lahir')}
                    className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors"
                >
                    <span>Umur</span>
                    {getSortIcon('tanggal_lahir')}
                </button>
            ) as any,
            render: (patient) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">{formatAge(patient.tanggal_lahir)}</div>
                        <div className="text-xs text-gray-500">{formatDate(patient.tanggal_lahir, 'dd MMM yyyy')}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'kontak',
            header: 'Kontak',
            render: (patient) => (
                <div className="space-y-1">
                    {patient.no_hp && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 group hover:text-blue-600 transition-colors">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium">{formatPhoneNumber(patient.no_hp)}</span>
                        </div>
                    )}
                    {patient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 group hover:text-blue-600 transition-colors">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
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
            header: (
                <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors"
                >
                    <span>Terdaftar</span>
                    {getSortIcon('created_at')}
                </button>
            ) as any,
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onView(patient);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                            title="Lihat detail"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(patient);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110"
                            title="Edit"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(patient);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
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
            {/* Modern Header dengan Search & Filter */}
            <div className="flex items-center gap-3">
                {/* Instant Search Input - No Debounce */}
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama, NIK, No. RM, email, telepon..."
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md bg-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Modern Filter Button */}
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`relative flex items-center gap-2 px-5 py-3 border-2 rounded-xl transition-all shadow-sm hover:shadow-md ${activeFilterCount > 0
                            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                >
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Modern Add Button */}
                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Pasien</span>
                    </button>
                )}
            </div>

            {/* Modern Filter Panel */}
            {showFilter && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Filter Pencarian</h3>
                            {activeFilterCount > 0 && (
                                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                    {activeFilterCount} filter aktif
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Jenis Kelamin */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={localFilters.jenis_kelamin || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        jenis_kelamin: e.target.value as any
                                    })}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                >
                                    <option value="">Semua</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            {/* Umur Min */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
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
                                    min="0"
                                    max="150"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Umur Max */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Umur Maksimal
                                </label>
                                <input
                                    type="number"
                                    value={localFilters.umur_max || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        umur_max: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                    placeholder="150"
                                    min="0"
                                    max="150"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Tanggal Daftar Dari */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Tanggal Daftar Dari
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.tanggal_daftar_dari || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        tanggal_daftar_dari: e.target.value
                                    })}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Tanggal Daftar Sampai */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Tanggal Daftar Sampai
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.tanggal_daftar_sampai || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        tanggal_daftar_sampai: e.target.value
                                    })}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <button
                                onClick={handleApplyFilter}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                onClick={handleResetFilter}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowFilter(false)}
                                className="ml-auto text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Info */}
            {(searchQuery || activeFilterCount > 0 || sortConfig) && (
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                    {searchQuery && (
                        <span className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Pencarian: <strong className="text-blue-700">"{searchQuery}"</strong>
                        </span>
                    )}
                    {activeFilterCount > 0 && (
                        <span className="flex items-center gap-2 border-l border-blue-300 pl-3">
                            <Filter className="w-4 h-4" />
                            <strong>{activeFilterCount}</strong> filter aktif
                        </span>
                    )}
                    {sortConfig && (
                        <span className="flex items-center gap-2 border-l border-blue-300 pl-3">
                            {sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            Diurutkan: <strong>{sortConfig.field}</strong>
                        </span>
                    )}
                    {totalItems > 0 && (
                        <span className="ml-auto font-semibold text-blue-700">{totalItems} pasien ditemukan</span>
                    )}
                </div>
            )}

            {/* Modern Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <Table
                    data={patients}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={
                        searchQuery || activeFilterCount > 0
                            ? 'Tidak ada pasien yang ditemukan dengan kriteria pencarian'
                            : 'Belum ada data pasien. Klik tombol "Tambah Pasien" untuk memulai.'
                    }
                    hoverable={true}
                />

                {!loading && patients.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showInfo={true}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalItems={totalItems}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}