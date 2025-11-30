'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';

// [1] Import Modal
import AppointmentModal from '../components/AppointmentModal';
import MedicalRecordModal from '../components/MedicalRecordModal'; // Import Modal Rekam Medis
import { getAppointmentColumns } from '../table/appointment-columns';

import { useToast, useModal, useAuth, ROLES } from '@/core';
import {
    useGetAppointments,
    useCancelAppointment
    // useCompleteAppointment <-- HAPUS INI (Logika pindah ke Modal Medis)
} from '@/core/services/api/appointment.api';

type ActionType = 'cancel'; // Hapus 'complete' dari sini

interface AppointmentListProps {
    scope?: 'me' | 'all';
}

export default function AppointmentList({ scope = 'all' }: AppointmentListProps) {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Role Checking
    const userRoles = user?.roles?.map((r: any) => r.name) || [];
    const isDoctor = userRoles.includes(ROLES.DOKTER) || userRoles.includes(ROLES.KEPALA_KLINIK);
    const isHeadOrStaff = userRoles.includes(ROLES.STAF) || userRoles.includes(ROLES.KEPALA_KLINIK);

    const [searchQuery, setSearchQuery] = useState('');

    // State Data
    const [selectedItem, setSelectedItem] = useState<any | null>(null); // Untuk Edit/Cancel
    const [selectedMedicalItem, setSelectedMedicalItem] = useState<any | null>(null); // [2] Untuk Rekam Medis

    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
    });

    // Filter Params
    const filterParams = useMemo(() => {
        if (scope === 'me' && user?.id) {
            return { doctor_id: user.id };
        }
        return {};
    }, [scope, user]);

    const { data: response, isLoading } = useGetAppointments({
        ...queryParams,
        ...filterParams
    });

    const cancelMutation = useCancelAppointment();

    // Modals Hooks
    const formModal = useModal();
    const confirmModal = useModal();
    const medicalModal = useModal(); // [3] Hook Modal Medis

    const appointmentList = useMemo(() => (response as any)?.data || [], [response]);

    // Filtering Client-side
    const filteredData = useMemo(() => {
        if (!appointmentList.length) return [];
        let data = appointmentList.filter((item: any) => item.status !== 'menunggu_konfirmasi');

        const query = searchQuery.toLowerCase();
        if (query) {
            data = data.filter((item: any) =>
                (item.patient?.nama_lengkap || '').toLowerCase().includes(query) ||
                (item.doctor?.nama_lengkap || '').toLowerCase().includes(query) ||
                (item.jam_janji || '').includes(query)
            );
        }
        return data;
    }, [appointmentList, searchQuery]);

    // --- HANDLERS ---

    const handleCreate = () => {
        setSelectedItem(null);
        formModal.open();
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        formModal.open();
    };

    // [4] HANDLER BARU: Klik Selesai -> Buka Modal Medis
    const handleCompleteClick = (item: any) => {
        setSelectedMedicalItem(item); // Set item untuk modal medis
        medicalModal.open();          // Buka modal
    };

    // Handler Cancel -> Buka Confirm Dialog
    const handleCancelClick = (item: any) => {
        setSelectedItem(item);
        confirmModal.open();
    };

    // Eksekusi Pembatalan
    const handleConfirmCancel = async () => {
        if (!selectedItem) return;
        try {
            await cancelMutation.mutateAsync({ id: selectedItem.id });
            toast.showSuccess('Kunjungan dibatalkan.');

            confirmModal.close();
            setSelectedItem(null);
            queryClient.invalidateQueries({ queryKey: ['/appointments'] });
        } catch (error: any) {
            toast.showError(error?.response?.data?.message || 'Gagal memproses aksi');
        }
    };

    // [5] Callback setelah Rekam Medis Disimpan
    const handleMedicalSuccess = () => {
        // Refresh tabel agar status berubah jadi 'selesai'
        queryClient.invalidateQueries({ queryKey: ['/appointments'] });
    };

    const showDoctorColumn = scope === 'all';

    // [6] Update Columns Definition
    const columns = useMemo(() => getAppointmentColumns({
        onComplete: handleCompleteClick, // <-- PENTING: Panggil handler modal, BUKAN openConfirm
        onCancel: handleCancelClick,
        onEdit: handleEdit,
        isDoctor: isDoctor,
        isHeadOrStaff: showDoctorColumn && isHeadOrStaff
    }), [isDoctor, isHeadOrStaff, showDoctorColumn]);

    const handlePageChange = (page: number) => setQueryParams(prev => ({ ...prev, page }));
    const title = scope === 'me' ? `Jadwal Saya (${user?.nama_lengkap})` : 'Semua Jadwal Klinik';

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>
                                Total {(response as any)?.count || 0} kunjungan terdaftar.
                            </CardDescription>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <SearchInput
                                    placeholder={scope === 'me' ? "Cari pasien..." : "Cari pasien atau dokter..."}
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>
                            <Button onClick={handleCreate} className="whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" /> Buat Janji
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada jadwal kunjungan."
                        pagination={{
                            currentPage: queryParams.page,
                            totalPages: (response as any)?.totalPages || 1,
                            totalItems: (response as any)?.count || 0,
                            itemsPerPage: queryParams.limit,
                            onPageChange: handlePageChange
                        } as any}
                    />
                </CardBody>
            </Card>

            {/* Modal Edit/Create Appointment */}
            <AppointmentModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                currentUser={user}
                isDoctor={isDoctor}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['/appointments'] });
                }}
            />

            {/* [7] Modal Rekam Medis (SOAP & Harga) */}
            <MedicalRecordModal
                isOpen={medicalModal.isOpen}
                onClose={medicalModal.close}
                appointment={selectedMedicalItem}
                onSuccess={handleMedicalSuccess}
            />

            {/* Dialog Konfirmasi (Hanya untuk Cancel) */}
            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmCancel}
                title="Batalkan Kunjungan?"
                message={`Anda akan membatalkan jadwal ini. Tindakan tidak dapat dikembalikan.`}
                variant="danger"
                confirmText="Batalkan Jadwal"
                isLoading={cancelMutation.isPending}
            />
        </>
    );
}