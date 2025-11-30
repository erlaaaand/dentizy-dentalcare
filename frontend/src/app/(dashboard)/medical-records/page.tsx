'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { FileText, ShieldAlert, Loader2, Users } from 'lucide-react';
import RecordList from './tabs/RecordList';
import { useRouter } from 'next/navigation';
import { ROLES, useAuth } from '@/core';

export default function MedicalRecordsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const userRoles = user?.roles?.map((r: any) => r.name) || [];

    // Role Checks
    const isStaff = userRoles.includes(ROLES.STAF);
    const isHeadClinic = userRoles.includes(ROLES.KEPALA_KLINIK);
    const isDoctor = userRoles.includes(ROLES.DOKTER);

    // Hanya Dokter & Kepala Klinik yang boleh masuk
    const hasAccess = isDoctor || isHeadClinic;

    if (authLoading) {
        return (
            <PageContainer title="Rekam Medis">
                <Card><CardBody className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" /></CardBody></Card>
            </PageContainer>
        );
    }

    if (isStaff || !hasAccess) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center flex flex-col items-center">
                        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Area Terbatas</h3>
                        <p className="text-gray-600 max-w-md">
                            Data rekam medis bersifat rahasia medis. Hanya Dokter dan Kepala Klinik yang memiliki akses ke halaman ini.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Kembali ke Dashboard
                        </button>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    // KONFIGURASI TABS
    const tabs = [];

    if (isHeadClinic) {
        // Kepala Klinik: 2 Tab
        tabs.push(
            {
                id: 'my-records',
                label: 'Pasien Saya',
                icon: <FileText className="w-4 h-4" />
            },
            {
                id: 'all-records',
                label: 'Semua Rekam Medis', // Mencakup dokter lain
                icon: <Users className="w-4 h-4" />
            }
        );
    } else {
        // Dokter Biasa: 1 Tab
        tabs.push({
            id: 'my-records',
            label: 'Rekam Medis Pasien',
            icon: <FileText className="w-4 h-4" />
        });
    }

    return (
        <PageContainer
            title="Rekam Medis Pasien"
            subtitle={isHeadClinic
                ? "Arsip lengkap riwayat medis klinik dan pasien pribadi Anda."
                : "Arsip riwayat pemeriksaan pasien Anda."}
        >
            <Tabs tabs={tabs} defaultTab="my-records" variant="pills">

                {/* Tab Pasien Saya (Tampil untuk Dokter & Kepala Klinik) */}
                <TabPanel tabId="my-records">
                    <RecordList scope="me" />
                </TabPanel>

                {/* Tab Semua (Hanya tampil untuk Kepala Klinik) */}
                {isHeadClinic && (
                    <TabPanel tabId="all-records">
                        <RecordList scope="all" />
                    </TabPanel>
                )}

            </Tabs>
        </PageContainer>
    );
}