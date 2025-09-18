'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppointmentFilters from './components/AppointmentsFilters';
import AppointmentsTable from './components/AppointmentsTable';
// import CreateAppointmentModal from './components/CreateAppointmentModal';
import DetailAppointmentModal from './components/DetailAppointmentModal';
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

    // ✅ PENTING: useMemo untuk mencegah infinite loop di CreateAppointmentModal
    const scheduledPatientIds = useMemo(() => {
        // Hanya ambil pasien yang statusnya 'dijadwalkan' untuk hari ini atau masa depan
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return appointments
            .filter(appointment => {
                // Filter hanya appointment yang dijadwalkan dan belum lewat
                if (appointment.status !== 'dijadwalkan') return false;

                const appointmentDate = new Date(appointment.tanggal_janji);
                appointmentDate.setHours(0, 0, 0, 0);

                return appointmentDate >= today;
            })
            .map(appointment => appointment.patient?.id)
            .filter((id): id is number => id !== undefined);
    }, [appointments]);

    // Alternative: Callback function untuk mendapatkan scheduled patient IDs
    const getScheduledPatientIds = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return appointments
            .filter(appointment => {
                if (appointment.status !== 'dijadwalkan') return false;

                const appointmentDate = new Date(appointment.tanggal_janji);
                appointmentDate.setHours(0, 0, 0, 0);

                return appointmentDate >= today;
            })
            .map(appointment => appointment.patient?.id)
            .filter((id): id is number => id !== undefined);
    }, [appointments]);

    const handleSelectAppointment = (appointment: ApiAppointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { ...filters, page: pagination.page, limit: pagination.limit };
            const response = await getAppointments(params);

            setAppointments(response.data);
            setPagination(prev => ({ ...prev, total: response.count }));

        } catch (err) {
            setError('Gagal memuat data janji temu.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctorData = await getUsers('dokter');
                setDoctors(doctorData);
            } catch (error) {
                console.error("Gagal memuat data dokter:", error);
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
        fetchData(); // Refresh data setelah appointment baru dibuat
    };

    const handleActionSuccess = () => {
        setIsDetailModalOpen(false);
        fetchData(); // Refresh data setelah action di detail modal
    };

    // Debug: Log untuk memantau perubahan scheduledPatientIds
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Scheduled Patient IDs:', scheduledPatientIds);
            console.log('Total scheduled patients:', scheduledPatientIds.length);
        }
    }, [scheduledPatientIds]);

    return (
        <>
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
            </header>

            <AppointmentFilters doctors={doctors} onFilterChange={handleFilterChange} />

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

            {/* DetailAppointmentModal */}
            {selectedAppointment && (
                <DetailAppointmentModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    appointment={selectedAppointment}
                    onActionSuccess={handleActionSuccess}
                />
            )}
        </>
    );
}