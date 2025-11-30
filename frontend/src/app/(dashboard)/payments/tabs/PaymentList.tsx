'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { CreditCard, CheckCircle2, Clock, Eye } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { useModal } from '@/core';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Import Hook
import { usePayments } from '@/core/services/api/payments.api';

interface PaymentListProps {
    status: 'pending' | 'history';
}

export default function PaymentList({ status }: PaymentListProps) {
    const paymentModal = useModal();
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Mapping Status Filter
    const dbStatus = status === 'pending' ? 'pending' : 'lunas';

    // Fetch API
    const { data: response, isLoading } = usePayments({
        page,
        limit,
        statusPembayaran: dbStatus as any,
    });

    const paymentList = useMemo(() => {
        return Array.isArray(response) ? response : (response as any)?.data || [];
    }, [response]);

    const handlePay = (row: any) => {
        setSelectedPayment(row);
        paymentModal.open();
    };

    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const columns = useMemo(() => [
        {
            header: 'Invoice',
            // [FIX] Ubah ke camelCase sesuai DTO Backend
            accessorKey: 'nomorInvoice',
            cell: (info: any) => {
                const val = info.getValue() || `#${info.row.original.id}`;
                return <span className="font-mono text-xs text-gray-500 font-semibold">{val}</span>;
            }
        },
        {
            header: 'Tanggal',
            // [FIX] Ubah ke camelCase (createdAt) agar tanggal muncul
            accessorKey: 'createdAt',
            cell: (info: any) => {
                const date = info.getValue();
                return date ? format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: idLocale }) : '-';
            }
        },
        {
            header: 'Pasien',
            accessorKey: 'patient',
            cell: (info: any) => (
                <div className="flex flex-col">
                    {/* DTO PatientSubsetDto menggunakan nama_lengkap (snake_case) */}
                    <span className="font-medium text-gray-900">{info.getValue()?.nama_lengkap || '-'}</span>
                    <span className="text-xs text-gray-500 font-mono">{info.getValue()?.nomor_rekam_medis || '-'}</span>
                </div>
            )
        },
        {
            header: 'Total Tagihan',
            // [FIX] Ubah ke camelCase
            accessorKey: 'totalAkhir',
            cell: (info: any) => {
                const val = info.getValue() ?? 0;
                return <span className="font-bold text-gray-900">{formatRp(Number(val))}</span>;
            }
        },
        {
            header: 'Status',
            // [FIX] Ubah ke camelCase
            accessorKey: 'statusPembayaran',
            cell: (info: any) => {
                const s = info.getValue();
                return s === 'lunas'
                    ? <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Lunas</Badge>
                    : <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> Menunggu</Badge>;
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => {
                if (status === 'pending') {
                    return (
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8"
                            onClick={() => handlePay(info.row.original)}
                        >
                            <CreditCard className="w-3 h-3 mr-2" /> Proses Bayar
                        </Button>
                    );
                }
                return (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePay(info.row.original)}
                    >
                        <Eye className="w-4 h-4 mr-2" /> Detail
                    </Button>
                );
            }
        }
    ], [status]);

    // Helper metadata
    const meta = (response as any)?.meta || {};

    return (
        <>
            <Card>
                <CardBody>
                    <DataTable
                        data={paymentList}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage={status === 'pending' ? "Tidak ada tagihan yang menunggu pembayaran." : "Belum ada riwayat transaksi."}

                        onPageChange={setPage}
                        onLimitChange={setLimit}

                        pagination={{
                            currentPage: page,
                            totalPages: meta.totalPages || 1,
                            itemsPerPage: limit,
                            totalItems: meta.total || 0,
                        }}
                    />
                </CardBody>
            </Card>

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={paymentModal.close}
                data={selectedPayment}
                readOnly={status === 'history'}
            />
        </>
    );
}