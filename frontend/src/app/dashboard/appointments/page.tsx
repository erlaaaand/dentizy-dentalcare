'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppointmentFilters from './components/AppointmentsFilters';
import AppointmentsTable from './components/AppointmentsTable';
import DetailAppointmentModal from './components/DetailAppointmentModal';
import CreateAppointmentModal from './components/CreateAppointmentModal';
import { getAppointments } from '@/lib/api/appointmentService';
import { getUsers } from '@/lib/api/userService';
import type { Appointment as ApiAppointment } from '@/types/api';

export default function AppointmentsPage() {
    // State untuk data
    const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({});
    const [doctors, setDoctors] = useState<{ id: number; nama_lengkap: string; }[]>([]);

    // State untuk modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<ApiAppointment | null>(null);

    // ✅ FIXED: useMemo untuk scheduledPatientIds dengan dependency yang tepat
    const scheduledPatientIds = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return appointments
            .filter(appointment => {
                // Filter hanya appointment yang dijadwalkan
                if (appointment.status !== 'dijadwalkan') return false;

                try {
                    const appointmentDate = new Date(appointment.tanggal_janji);
                    appointmentDate.setHours(0, 0, 0, 0);
                    
                    // Hanya appointment hari ini atau masa depan
                    return appointmentDate >= today;
                } catch {
                    return false;
                }
            })
            .map(appointment => appointment.patient?.id)
            .filter((id): id is number => id !== undefined && id !== null);
    }, [appointments]); // Hanya depend pada appointments

    const handleSelectAppointment = (appointment: ApiAppointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    // ✅ FIXED: fetchData dengan error handling yang lebih baik
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const params = { 
                ...filters, 
                page: pagination.page, 
                limit: pagination.limit 
            };
            
            const response = await getAppointments(params);

            // Validasi response
            if (!response || !Array.isArray(response.data)) {
                throw new Error('Invalid response format');
            }

            setAppointments(response.data);
            setPagination(prev => ({ 
                ...prev, 
                total: response.count || 0 
            }));

        } catch (err: any) {
            const errorMessage = err.message || 'Gagal memuat data janji temu.';
            setError(errorMessage);
            setAppointments([]);
            console.error('Error fetching appointments:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ FIXED: Fetch doctors dengan error handling
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctorData = await getUsers('dokter');
                
                // Validasi response
                if (!Array.isArray(doctorData)) {
                    throw new Error('Invalid doctor data format');
                }
                
                setDoctors(doctorData);
            } catch (error: any) {
                console.error("Gagal memuat data dokter:", error);
                setDoctors([]);
                // Optionally show a toast notification here
            }
        };

        fetchDoctors();
    }, []);

    const handleFilterChange = (newFilters: object) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        setFilters(newFilters);
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchData();
    };

    const handleActionSuccess = () => {
        setIsDetailModalOpen(false);
        fetchData();
    };

    return (
        <>
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 shadow-lg rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                            Jadwal Janji Temu
                        </h1>
                        <p className="text-indigo-100 mt-1">
                            Kelola semua jadwal janji temu pasien
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={doctors.length === 0}
                        className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={doctors.length === 0 ? 'Tidak ada dokter tersedia' : 'Buat janji temu baru'}
                    >
                        + Buat Janji Temu Baru
                    </button>
                    {doctors.length === 0 && (
                        <p className="text-indigo-100 text-sm mt-2">
                            ⚠️ Tidak ada dokter tersedia. Hubungi administrator.
                        </p>
                    )}
                </div>
            </header>

            {/* Filters */}
            <AppointmentFilters 
                doctors={doctors} 
                onFilterChange={handleFilterChange} 
            />

            {/* Table */}
            <div className="mt-6">
                <AppointmentsTable
                    appointments={appointments}
                    isLoading={isLoading}
                    error={error}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onActionSuccess={fetchData}
                    onSelectAppointment={handleSelectAppointment}
                />
            </div>

            {/* Detail Modal */}
            {selectedAppointment && (
                <DetailAppointmentModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedAppointment(null);
                    }}
                    appointment={selectedAppointment}
                    onActionSuccess={handleActionSuccess}
                />
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <CreateAppointmentModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreateSuccess={handleCreateSuccess}
                    doctors={doctors}
                    scheduledPatientIds={scheduledPatientIds}
                />
            )}
        </>
    );
}