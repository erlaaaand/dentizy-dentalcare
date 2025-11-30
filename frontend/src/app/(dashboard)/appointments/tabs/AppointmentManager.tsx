'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';

// [1] Import Modal yang Benar
import AppointmentModal from '../components/AppointmentModal';
import MedicalRecordModal from '../components/MedicalRecordModal'; // Import Modal Rekam Medis
import { getAppointmentColumns } from '../table/appointment-columns';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useAuth } from '@/core/hooks/auth/useAuth';
import { useRole } from '@/core/hooks/auth/useRole';
import { ROLES } from '@/core';

import {
    useGetAppointments,
    useCancelAppointment
    // useCompleteAppointment <-- Dihapus, karena logic pindah ke MedicalRecordModal
} from '@/core/services/api/appointment.api';

// Tipe action hanya sisa 'cancel' karena 'complete' punya modal sendiri
type ActionType = 'cancel';

export default function AppointmentManager() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { isDokter } = useRole();

    // Hitung apakah user adalah Staff atau Kepala Klinik
    const isHeadOrStaff = useMemo(() => {
        const userRoles = user?.roles?.map((r: any) => r.name) || [];
        return userRoles.includes(ROLES.STAF) || userRoles.includes(ROLES.KEPALA_KLINIK);
    }, [user]);

    const [searchQuery, setSearchQuery] = useState('');

    // State untuk item yang dipilih
    const [selectedItem, setSelectedItem] = useState<any | null>(null); // Untuk Edit/Cancel
    const [selectedMedicalItem, setSelectedMedicalItem] = useState<any | null>(null); // [2] Untuk Medical Record

    const [actionType, setActionType] = useState<ActionType>('cancel');

    // Query Params
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
    });

    const { data: response, isLoading } = useGetAppointments({ ...queryParams });
    const cancelMutation = useCancelAppointment();

    // Modals Hooks
    const formModal = useModal();
    const confirmModal = useModal();
    const medicalModal = useModal(); // [3] Hook untuk Modal Medis

    // Data handling
    const appointmentList = useMemo(() => (response as any)?.data || [], [response]);

    // Client-side search
    const filteredData = useMemo(() => {
        if (!appointmentList.length) return [];
        const query = searchQuery.toLowerCase();
        if (!query) return appointmentList;

        return appointmentList.filter((item: any) =>
            (item.patient?.nama_lengkap || '').toLowerCase().includes(query) ||
            (item.doctor?.nama_lengkap || '').toLowerCase().includes(query) ||
            (item.jam_janji || '').includes(query)
        );
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

    // [4] Handler Baru: Saat tombol 'Selesaikan' diklik -> Buka Modal Medis
    const handleComplete = (item: any) => {
        setSelectedMedicalItem(item);
        medicalModal.open();
    };

    // Handler Cancel -> Buka Confirm Dialog
    const handleCancel = (item: any) => {
        setSelectedItem(item);
        setActionType('cancel');
        confirmModal.open();
    };

    // Eksekusi Pembatalan
    const handleConfirmAction = async () => {
        if (!selectedItem) return;
        try {
            // Hanya menangani cancel di sini
            if (actionType === 'cancel') {
                await cancelMutation.mutateAsync({ id: selectedItem.id });
                toast.showSuccess('Status: Dibatalkan');
            }

            confirmModal.close();
            setSelectedItem(null);
            queryClient.invalidateQueries({ queryKey: ['/appointments'] });
        } catch (error: any) {
            toast.showError(error?.response?.data?.message || 'Gagal memproses aksi');
        }
    };

    // [5] Update logic callback saat Medical Modal sukses
    const handleMedicalSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['/appointments'] });
        // Jika Anda punya query key untuk rekam medis, invalidate juga di sini
    };

    // Columns Definition
    const columns = useMemo(() => getAppointmentColumns({
        onComplete: handleComplete, // [6] Hubungkan ke handler modal medis
        onCancel: handleCancel,
        onEdit: handleEdit,
        isDoctor: isDokter,
        isHeadOrStaff: isHeadOrStaff
    }), [isDokter, isHeadOrStaff]);

    // Pagination
    const handlePageChange = (page: number) => setQueryParams(prev => ({ ...prev, page }));

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Daftar Jadwal</CardTitle>
                            <CardDescription>Total {(response as any)?.count || 0} kunjungan.</CardDescription>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <SearchInput
                                    placeholder="Cari nama pasien..."
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
                        emptyMessage="Belum ada jadwal kunjungan."
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

            {/* Modal Form Appointment (Create/Edit) */}
            <AppointmentModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                currentUser={user}
                isDoctor={isDokter}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['/appointments'] });
                }}
            />

            {/* [7] Modal Rekam Medis (SOAP + Payment) */}
            <MedicalRecordModal
                isOpen={medicalModal.isOpen}
                onClose={medicalModal.close}
                appointment={selectedMedicalItem}
                onSuccess={handleMedicalSuccess}
            />

            {/* Confirm Dialog (Hanya untuk Cancel) */}
            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmAction}
                title="Batalkan Kunjungan?"
                message={`Pembatalan untuk ${selectedItem?.patient?.nama_lengkap} tidak dapat dikembalikan.`}
                variant="danger"
                confirmText="Ya, Batalkan"
                isLoading={cancelMutation.isPending}
            />
        </>
    );
}