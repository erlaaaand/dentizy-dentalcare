'use client';

import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import MedicalRecordDetailModal from '../components/MedicalRecordDetailModal';
import { getRecordColumns } from '../table/record-columns';

import { useModal, useAuth, ROLES } from '@/core';
import { useMedicalRecordsControllerFindAll } from '@/core/api/generated/medical-records/medical-records';

interface RecordListProps {
    scope?: 'me' | 'all';
}

export default function RecordList({ scope = 'all' }: RecordListProps) {
    const { user } = useAuth();
    const detailModal = useModal();
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
    });

    // Tentukan ID Dokter jika scope 'me'
    const targetDoctorId = (scope === 'me' && user?.id) ? Number(user.id) : undefined;

    // Fetch data dari API
    const { data: response, isLoading, refetch } = useMedicalRecordsControllerFindAll({
        page: queryParams.page,
        limit: queryParams.limit,
        doctor_id: targetDoctorId,
        // search: searchQuery // Aktifkan jika API support search query param
    });

    const recordList = useMemo(() => (response as any)?.data || [], [response]);

    // Client-side filtering (Jika API belum support search complex)
    const filteredData = useMemo(() => {
        if (!recordList.length) return [];
        const query = searchQuery.toLowerCase();
        if (!query) return recordList;

        return recordList.filter((item: any) =>
            (item.patient?.nama_lengkap || '').toLowerCase().includes(query) ||
            (item.patient?.nomor_rekam_medis || '').toLowerCase().includes(query) ||
            (item.assessment || '').toLowerCase().includes(query)
        );
    }, [recordList, searchQuery]);

    const handleViewDetail = (record: any) => {
        setSelectedRecord(record);
        detailModal.open();
    };

    const showDoctorColumn = scope === 'all';

    const columns = useMemo(() => getRecordColumns({
        onView: handleViewDetail,
        showDoctorColumn: showDoctorColumn
    }), [showDoctorColumn]);

    const handlePageChange = (page: number) => setQueryParams(prev => ({ ...prev, page }));

    const title = scope === 'me' ? 'Pasien Saya' : 'Semua Rekam Medis';
    const description = scope === 'me'
        ? 'Riwayat pemeriksaan pasien yang Anda tangani.'
        : 'Arsip seluruh pemeriksaan medis di klinik.';

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>
                                Total {(response as any)?.total || 0} riwayat medis tersimpan.
                            </CardDescription>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <SearchInput
                                    placeholder="Cari Pasien, RM, atau Diagnosa..."
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
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Belum ada data rekam medis."
                        pagination={{
                            currentPage: queryParams.page,
                            totalPages: (response as any)?.totalPages || 1,
                            totalItems: (response as any)?.total || 0,
                            itemsPerPage: queryParams.limit,
                            onPageChange: handlePageChange
                        } as any}
                    />
                </CardBody>
            </Card>

            <MedicalRecordDetailModal
                isOpen={detailModal.isOpen}
                onClose={detailModal.close}
                data={selectedRecord}
            />
        </>
    );
}