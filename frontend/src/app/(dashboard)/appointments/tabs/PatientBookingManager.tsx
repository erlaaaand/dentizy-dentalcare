'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, CalendarPlus, Search, Phone, MapPin, User, Clock, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import AppointmentModal from '../components/AppointmentModal';
import { useAuth } from '@/core';

// API Hook
import { usePatientsControllerSearch } from '@/core/api/generated/patients/patients';
import { useGetAppointments } from '@/core/services/api/appointment.api'; // [BARU] Import API Appointment

export default function PatientBookingManager() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Fetch Active Patients (Data Tabel Utama)
    const { data: response, isLoading: isLoadingPatients, refetch } = usePatientsControllerSearch({
        is_active: true,
        search: searchQuery
    });

    // [BARU] 2. Fetch Pasien yang sedang memiliki janji aktif (Dijadwalkan / Menunggu Konfirmasi)
    // Kita ambil limit agak besar untuk memastikan ter-cover (atau sesuaikan dengan kebutuhan)
    const { data: scheduledData } = useGetAppointments({ status: 'dijadwalkan' as any, limit: 1000 });
    const { data: pendingData } = useGetAppointments({ status: 'menunggu_konfirmasi' as any, limit: 1000 });

    const patientList = useMemo(() => {
        return Array.isArray(response) ? response : (response as any)?.data || [];
    }, [response]);

    // [BARU] 3. Buat Set ID Pasien yang sibuk agar pencarian O(1)
    const patientStatusMap = useMemo(() => {
        const map = new Map<number, string>(); // Map<PatientID, Status>

        const sList = (scheduledData as any)?.data || [];
        const pList = (pendingData as any)?.data || [];

        sList.forEach((app: any) => {
            if (app.patient_id) map.set(app.patient_id, 'dijadwalkan');
        });
        pList.forEach((app: any) => {
            if (app.patient_id) map.set(app.patient_id, 'menunggu_konfirmasi');
        });

        return map;
    }, [scheduledData, pendingData]);

    const handleBookAppointment = (patient: any) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        // Refresh appointment list di background agar status terbaru terambil
        queryClient.invalidateQueries({ queryKey: ['/appointments'] });
    };

    // [UPDATE] 4. Update Columns untuk mengecek status
    const columns = useMemo(() => [
        {
            header: 'No. RM',
            accessorKey: 'nomor_rekam_medis',
            cell: (info: any) => (
                <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                    {info.getValue()}
                </span>
            )
        },
        {
            header: 'Nama Pasien',
            accessorKey: 'nama_lengkap',
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                    <span className="text-xs text-gray-500">NIK: {info.row.original.nik || '-'}</span>
                </div>
            )
        },
        {
            header: 'Kontak',
            accessorKey: 'no_hp',
            cell: (info: any) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {info.getValue()}
                </div>
            )
        },
        {
            header: 'Alamat',
            accessorKey: 'alamat',
            cell: (info: any) => (
                <div className="flex items-center gap-2 text-sm text-gray-600 max-w-[200px] truncate" title={info.getValue()}>
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    {info.getValue()}
                </div>
            )
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => {
                const patientId = info.row.original.id;
                const status = patientStatusMap.get(patientId);
                const isBusy = !!status;

                // Tentukan Label & Icon berdasarkan status
                let label = 'Buat Janji';
                let Icon = CalendarPlus;
                let btnClass = "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300";

                if (status === 'dijadwalkan') {
                    label = 'Sedang Dijadwalkan';
                    Icon = Clock;
                    btnClass = "border-yellow-200 text-yellow-700 bg-yellow-50 opacity-80";
                } else if (status === 'menunggu_konfirmasi') {
                    label = 'Menunggu Konfirmasi';
                    Icon = AlertCircle;
                    btnClass = "border-orange-200 text-orange-700 bg-orange-50 opacity-80";
                }

                return (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookAppointment(info.row.original)}
                        disabled={isBusy} // [BARU] Disable jika sibuk
                        className={isBusy ? `cursor-not-allowed ${btnClass}` : btnClass}
                        title={isBusy ? `Pasien ini sudah memiliki jadwal dengan status: ${status}` : "Buat jadwal baru"}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                    </Button>
                );
            }
        }
    ], [patientStatusMap]); // [PENTING] Re-render kolom jika data status berubah

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Data Pasien Aktif</CardTitle>
                            <CardDescription>
                                Cari pasien dan buatkan jadwal kunjungan langsung (Walk-in).
                            </CardDescription>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <SearchInput
                                    placeholder="Cari Nama, NIK, atau No. RM..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>
                            <Button variant="outline" onClick={() => refetch()} title="Refresh Data">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={patientList}
                        columns={columns}
                        isLoading={isLoadingPatients}
                        emptyMessage={searchQuery ? "Pasien tidak ditemukan." : "Ketik nama pasien untuk mencari."}
                        pagination={{
                            currentPage: 1,
                            totalPages: Math.ceil(patientList.length / 10),
                            totalItems: patientList.length,
                            itemsPerPage: 10
                        }}
                    />
                </CardBody>
            </Card>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultPatient={selectedPatient}
                currentUser={user}
                isDoctor={false}
                onSuccess={handleSuccess}
            />
        </>
    );
}