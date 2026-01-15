'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, UserCheck, CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import { Badge } from '@/components/ui/data-display/badge';
import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';

import {
    useGetAppointments,
    useUpdateAppointment
} from '@/core/services/api/appointment.api';
import { usePatientsControllerActivatePatient } from '@/core/api/generated/patients/patients';

export default function VerificationManager() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const confirmModal = useModal();

    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // [FIX] Menggunakan 'as any' untuk status karena generated type mungkin belum update
    const { data: response, isLoading, refetch } = useGetAppointments({
        status: 'menunggu_konfirmasi' as any,
        limit: 50
    });

    const activatePatientMutation = usePatientsControllerActivatePatient();
    const updateAppointmentMutation = useUpdateAppointment();

    const requestList = useMemo(() => (response as any)?.data || [], [response]);

    const handleVerifyClick = useCallback((item: any) => {
        setSelectedItem(item);
        confirmModal.open();
    }, [confirmModal]);

    const handleConfirmVerification = async () => {
        if (!selectedItem) return;

        try {
            // 1. Aktifkan pasien jika belum aktif
            if (selectedItem.patient?.is_active === false) {
                await activatePatientMutation.mutateAsync({ id: selectedItem.patient.id });
            }

            // 2. Ubah status appointment jadi 'dijadwalkan'
            await updateAppointmentMutation.mutateAsync({
                id: selectedItem.id,
                data: { status: 'dijadwalkan' } as any
            });

            toast.showSuccess(`Jadwal untuk ${selectedItem.patient?.nama_lengkap} berhasil disetujui.`);

            confirmModal.close();
            setSelectedItem(null);
            // Refresh kedua tab: verifikasi dan appointment list utama
            queryClient.invalidateQueries({ queryKey: ['/appointments'] });

        } catch (error: any) {
            toast.showError('Gagal memproses verifikasi. Silakan coba lagi.');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Waktu Request',
            accessorKey: 'tanggal_janji',
            cell: (info: any) => {
                const date = info.getValue();
                const time = info.row.original.jam_janji;
                return (
                    <div className="flex flex-col text-sm">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                            <CalendarDays className="w-3 h-3" />
                            {date ? format(new Date(date), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            {time ? time.substring(0, 5) : '-'} WIB
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Pasien',
            accessorKey: 'patient',
            cell: (info: any) => {
                const p = info.getValue();
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{p?.nama_lengkap}</span>
                        <span className="text-xs text-gray-500 font-mono">NIK: {p?.nik || '-'}</span>
                        {!p?.is_active && (
                            <Badge variant="warning" className="w-fit text-[10px] px-1 py-0 mt-1">
                                Pasien Baru
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Dokter Tujuan',
            accessorKey: 'doctor',
            cell: (info: any) => (
                <span className="text-sm text-gray-700 font-medium">
                    {info.getValue()?.nama_lengkap}
                </span>
            )
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <Button
                    size="sm"
                    onClick={() => handleVerifyClick(info.row.original)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs"
                >
                    <UserCheck className="w-3 h-3 mr-2" />
                    Verifikasi & Terima
                </Button>
            )
        }
    ], [handleVerifyClick]);

    const confirmMessage = useMemo(() => {
        if (!selectedItem) return null;
        const p = selectedItem.patient;
        return (
            <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium mb-1">Konfirmasi Data Pasien</p>
                    <p className="text-xs text-yellow-700">Pastikan NIK <strong>{p?.nik}</strong> sesuai dengan KTP fisik pasien.</p>
                </div>
                <p className="text-sm text-gray-600">
                    Dengan menekan tombol di bawah, <strong>Pasien akan diaktifkan</strong> dan <strong>Jadwal disetujui</strong>.
                </p>
            </div>
        );
    }, [selectedItem]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Permintaan Jadwal Masuk</CardTitle>
                            <CardDescription>Daftar booking online yang menunggu persetujuan.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh">
                            <RefreshCw className="w-4 h-4 mr-2" /> Segarkan
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={requestList}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada permintaan jadwal baru."
                    />
                </CardBody>
            </Card>

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmVerification}
                title="Verifikasi Booking"
                message={confirmMessage}
                confirmText="Terima & Jadwalkan"
                cancelText="Tutup"
                isLoading={activatePatientMutation.isPending || updateAppointmentMutation.isPending}
            />
        </>
    );
}