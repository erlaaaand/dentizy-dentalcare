'use client';

import React, { useState, useEffect } from 'react';
import AppointmentFilters from './components/AppointmentsFilters';
import AppointmentsTable from './components/AppointmentsTable';
import CreateAppointmentModal from './components/CreateAppointmentModal';
// import { getAppointments } from '@/services/appointmentService'; // Asumsi service API

export default function AppointmentsPage() {
    // State untuk menyimpan data dari backend
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State untuk UI
    const [isModalOpen, setIsModalOpen] = useState(false);

    // TODO: Ganti ini dengan data dari API (misal: daftar dokter)
    const doctors = [
        { id: 1, name: 'Dr. Anisa Putri' },
        { id: 2, name: 'Dr. Budi' },
    ];

    // Fungsi untuk mengambil data (akan dipanggil saat komponen dimuat)
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // const response = await getAppointments(); // Panggil API
            // setAppointments(response.data);

            // Untuk sementara, kita gunakan data dummy
            const dummyData = [
                { id: 1, time: '09:00', patientName: 'Sari Indah', doctorName: 'Dr. Anisa Putri', treatment: 'Scaling', status: 'Selesai' },
                { id: 2, time: '10:30', patientName: 'Budi Santoso', doctorName: 'Dr. Anisa Putri', treatment: 'Tambal Gigi', status: 'Menunggu' },
            ];
            setAppointments(dummyData as any);

        } catch (err) {
            setError('Gagal memuat data janji temu.');
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect untuk memanggil fetchData saat komponen pertama kali dirender
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {/* Header Halaman */}
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Jadwal Janji Temu</h1>
                    <p className="text-gray-600 mt-1">Kelola semua jadwal janji temu pasien</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Buat Janji Temu
                </button>
            </header>

            {/* Filter dan Pencarian */}
            <AppointmentFilters doctors={doctors} onFilterChange={(filters) => {
                console.log('Filter berubah:', filters);
                // TODO: Panggil fetchData dengan parameter filter
            }} />

            {/* Tabel Janji Temu */}
            <div className="mt-6">
                <AppointmentsTable
                    appointments={appointments}
                    isLoading={isLoading}
                    error={error}
                    onActionSuccess={fetchData} // Refresh data setelah aksi berhasil
                />
            </div>

            {/* Modal untuk Membuat Janji Temu Baru */}
            <CreateAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData(); // Refresh data setelah janji temu baru dibuat
                }}
            />
        </>
    );
}