'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import { getPublicPatientColumns } from '../table/public-patient-columns';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';

// Asumsi: Hook ini sudah digenerate Orval atau kita buat manual di service patient
// Import path ini sesuaikan dengan struktur API Anda
import { usePatientsControllerSearch, usePatientsControllerActivatePatient } from '@/core/api/generated/patients/patients';

export default function PublicPatientManager() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const confirmModal = useModal();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

    // Fetch pasien yang: Online & Belum Aktif
    const { data: response, isLoading, refetch } = usePatientsControllerSearch({
        is_active: false,
        // Kita butuh flag di API untuk filter specific 'is_registered_online', 
        // tapi jika search endpoint support filter, gunakan itu. 
        // Jika tidak, kita filter client side sementara.
        search: searchQuery
    });

    const activateMutation = usePatientsControllerActivatePatient();

    const patientList = useMemo(() => {
        const data = Array.isArray(response) ? response : (response as any)?.data || [];
        // Filter client-side tambahan untuk memastikan hanya yang online
        return data.filter((p: any) => p.is_registered_online === true && p.is_active === false);
    }, [response]);

    const handleVerifyClick = useCallback((patient: any) => {
        setSelectedPatient(patient);
        confirmModal.open();
    }, [confirmModal]);

    const handleConfirmVerification = useCallback(async () => {
        if (!selectedPatient) return;

        try {
            await activateMutation.mutateAsync({ id: selectedPatient.id });
            toast.showSuccess(`Pasien ${selectedPatient.nama_lengkap} berhasil diaktifkan.`);
            confirmModal.close();
            setSelectedPatient(null);
            // Invalidate appointments juga karena mungkin ada appointment yang terkait
            queryClient.invalidateQueries({ queryKey: ['/patients'] });
            queryClient.invalidateQueries({ queryKey: ['/appointments'] });
        } catch (error: any) {
            toast.showError('Gagal mengaktifkan pasien. Silakan coba lagi.');
        }
    }, [selectedPatient, activateMutation, toast, confirmModal, queryClient]);

    const columns = useMemo(() =>
        getPublicPatientColumns({ onVerify: handleVerifyClick }),
        [handleVerifyClick]);

    const confirmMessage = useMemo(() => {
        if (!selectedPatient) return null;
        return (
            <div className="space-y-3">
                <p>Apakah Anda yakin data pasien berikut sudah sesuai dengan dokumen fisik (KTP/Identitas)?</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">Nama:</span>
                        <span className="col-span-2 text-gray-900">{selectedPatient.nama_lengkap}</span>

                        <span className="font-semibold text-gray-600">NIK:</span>
                        <span className="col-span-2 text-gray-900 font-mono">{selectedPatient.nik}</span>

                        <span className="font-semibold text-gray-600">Lahir:</span>
                        <span className="col-span-2 text-gray-900">{selectedPatient.tanggal_lahir}</span>
                    </div>
                </div>
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ Pasien akan diaktifkan dan dapat memulai pelayanan medis.
                </p>
            </div>
        );
    }, [selectedPatient]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Verifikasi Pasien Baru</CardTitle>
                            <CardDescription>
                                Daftar pasien yang mendaftar via website dan menunggu verifikasi data fisik.
                            </CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64">
                                <SearchInput
                                    placeholder="Cari nama atau NIK..."
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
                        isLoading={isLoading}
                        emptyMessage="Tidak ada pasien baru yang perlu diverifikasi."
                        pagination={{
                            currentPage: 1,
                            totalPages: Math.ceil(patientList.length / 10),
                            totalItems: patientList.length,
                            itemsPerPage: 10
                        }}
                    />
                </CardBody>
            </Card>

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmVerification}
                title="Verifikasi Data Pasien"
                message={confirmMessage}
                variant="compact"
                confirmText="Verifikasi & Aktifkan"
                cancelText="Batal"
                isLoading={activateMutation.isPending}
            />
        </>
    );
}