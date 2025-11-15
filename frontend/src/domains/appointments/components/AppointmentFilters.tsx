'use client';

import React, { useState, useEffect } from 'react';
import { AppointmentStatus, User } from '@/core/types/api';
import { userService } from '@/lib/api';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import { Filter, X } from 'lucide-react';

export interface AppointmentFilterValues {
    doctorId?: number;
    status?: AppointmentStatus | '';
    startDate?: string;
    endDate?: string;
}

interface AppointmentFiltersProps {
    onFilterChange: (filters: AppointmentFilterValues) => void;
    initialFilters?: AppointmentFilterValues;
}

export function AppointmentFilters({ onFilterChange, initialFilters = {} }: AppointmentFiltersProps) {
    const [filters, setFilters] = useState<AppointmentFilterValues>(initialFilters);
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        onFilterChange(filters);
    }, [filters]);

    const loadDoctors = async () => {
        setLoadingDoctors(true);
        try {
            const data = await userService.getDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('Failed to load doctors:', error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleFilterChange = (key: keyof AppointmentFilterValues, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        const clearedFilters: AppointmentFilterValues = {
            doctorId: undefined,
            status: '',
            startDate: undefined,
            endDate: undefined,
        };
        setFilters(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Filter</span>
                    {hasActiveFilters && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                            Aktif
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearFilters();
                            }}
                            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            <span>Hapus Filter</span>
                        </button>
                    )}

                    <span className="text-gray-400">
                        {isExpanded ? '▲' : '▼'}
                    </span>
                </div>
            </button>

            {/* Filter Options */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Doctor Filter */}
                    <div>
                        <label htmlFor="doctor-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Dokter
                        </label>
                        <select
                            id="doctor-filter"
                            value={filters.doctorId || ''}
                            onChange={(e) => handleFilterChange('doctorId', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loadingDoctors}
                        >
                            <option value="">Semua Dokter</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.nama_lengkap}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="status-filter"
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value as AppointmentStatus | '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Status</option>
                            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date Filter */}
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min={filters.startDate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}