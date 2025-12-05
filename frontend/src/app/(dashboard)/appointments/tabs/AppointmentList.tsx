'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';

import AppointmentModal from '../components/AppointmentModal';
import MedicalRecordModal from '../components/MedicalRecordModal';
import { getAppointmentColumns } from '../table/appointment-columns';

import { useToast, useModal, useAuth, ROLES } from '@/core';
import {
    useGetAppointments,
    useCancelAppointment
} from '@/core/services/api/appointment.api';

interface AppointmentListProps {
    scope?: 'me' | 'all';
}

export default function AppointmentList({ scope = 'all' }: AppointmentListProps) {
    const toast = useToast();
    const queryClient = useQueryClient(); // [1] Pastikan hook ini ada
    const { user } = useAuth();

    const userRoles = user?.roles?.map((r: any) => r.name) || [];
    const isDoctor = userRoles.includes(ROLES.DOKTER) || userRoles.includes(ROLES.KEPALA_KLINIK);
    const isHeadOrStaff = userRoles.includes(ROLES.STAF) || userRoles.includes(ROLES.KEPALA_KLINIK);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [selectedMedicalItem, setSelectedMedicalItem] = useState<any | null>(null);

    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
    });

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

    const formModal = useModal();
    const confirmModal = useModal();
    const medicalModal = useModal();

    const appointmentList = useMemo(() => (response as any)?.data || [], [response]);

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

    const handleCompleteClick = (item: any) => {
        setSelectedMedicalItem(item);
        medicalModal.open();
    };

    const handleCancelClick = (item: any) => {
        setSelectedItem(item);
        confirmModal.open();
    };

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

    // [FIX UTAMA] Callback ini dipanggil setelah Rekam Medis selesai dibuat
    const handleMedicalSuccess = () => {
        // 1. Refresh data Appointment (agar status berubah jadi Selesai)
        queryClient.invalidateQueries({ queryKey: ['/appointments'] });
        
        // 2. Refresh data Payments (agar tagihan baru muncul di kasir tanpa reload)
        // Pastikan key ini cocok dengan queryKey di useGetPayments
        queryClient.invalidateQueries({ queryKey: ['/payments'] }); 

        // 3. Refresh data Medical Records (agar muncul di list riwayat)
        queryClient.invalidateQueries({ queryKey: ['/medical-records'] });

        // 4. Refresh data Treatments (jika ada update stok/statistik)
        queryClient.invalidateQueries({ queryKey: ['/treatments'] });
    };

    const showDoctorColumn = scope === 'all';

    const columns = useMemo(() => getAppointmentColumns({
        onComplete: handleCompleteClick,
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

            {/* Modal Rekam Medis */}
            <MedicalRecordModal
                isOpen={medicalModal.isOpen}
                onClose={medicalModal.close}
                appointment={selectedMedicalItem}
                onSuccess={handleMedicalSuccess} // Panggil fungsi refresh komplit
            />

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