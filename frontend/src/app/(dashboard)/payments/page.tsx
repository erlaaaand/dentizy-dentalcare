'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { ShieldAlert, Loader2, Wallet, History } from 'lucide-react';
import { ROLES, useAuth } from '@/core';

import PaymentList from './tabs/PaymentList';

export default function PaymentsPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <PageContainer title="Kasir">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </PageContainer>
        );
    }

    // Proteksi Akses: Hanya Staff & Head (Dokter Ditolak)
    const userRoles = user?.roles?.map((r: any) => r.name) || [];
    const hasAccess = userRoles.includes(ROLES.STAF) || userRoles.includes(ROLES.KEPALA_KLINIK);

    if (!hasAccess) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center flex flex-col items-center">
                        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">Area Terbatas</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Halaman ini khusus untuk Staf Kasir dan Kepala Klinik.
                            Dokter tidak memiliki akses ke modul pembayaran.
                        </p>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    // Konfigurasi Tabs
    const tabs = [
        { id: 'pending', label: 'Menunggu Pembayaran', icon: <Wallet className="w-4 h-4" /> },
        { id: 'history', label: 'Riwayat Transaksi', icon: <History className="w-4 h-4" /> },
    ];

    return (
        <PageContainer
            title="Kasir & Pembayaran"
            subtitle="Pusat pengelolaan transaksi dan tagihan pasien."
        >
            <Tabs tabs={tabs} defaultTab="pending" variant="pills">
                <TabPanel tabId="pending">
                    <PaymentList status="pending" />
                </TabPanel>
                <TabPanel tabId="history">
                    <PaymentList status="history" />
                </TabPanel>
            </Tabs>
        </PageContainer>
    );
}