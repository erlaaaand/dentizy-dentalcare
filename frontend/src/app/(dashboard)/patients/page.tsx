'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { Users, ShieldAlert, Loader2, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROLES, useAuth } from '@/core';

// Component Baru
import PatientList from './tabs/PatientList';

export default function PatientsPage() {
    const { user, loading: authLoading } = useAuth();

    const userRoles = user?.roles?.map((r: any) => r.name) || [];

    // Identifikasi Role
    const isHeadClinic = userRoles.includes(ROLES.KEPALA_KLINIK);
    const isStaff = userRoles.includes(ROLES.STAF);
    const isDoctor = userRoles.includes(ROLES.DOKTER);

    // Permission Logic
    // Head & Staff: Bisa Manage (Create/Edit/Delete) & Lihat Semua
    const canManage = isHeadClinic || isStaff;

    // Access Check
    const hasAccess = isHeadClinic || isStaff || isDoctor;

    if (authLoading) {
        return (
            <PageContainer title="Data Pasien">
                <Card><CardBody className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" /></CardBody></Card>
            </PageContainer>
        );
    }

    if (!hasAccess) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center">
                        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Akses Ditolak</h3>
                        <p className="text-gray-500">Anda tidak memiliki izin untuk halaman ini.</p>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    // Konfigurasi Tabs
    const tabs = [];

    // Tab 1: Semua Pasien (Untuk Head & Staff)
    if (canManage) {
        tabs.push({
            id: 'all-patients',
            label: 'Semua Pasien',
            icon: <Users className="w-4 h-4" />
        });
    }

    // Tab 2: Pasien Saya (Untuk Dokter & Kepala Klinik yg praktek)
    if (isDoctor || isHeadClinic) {
        tabs.push({
            id: 'my-patients',
            label: 'Pasien Saya',
            icon: <UserCheck className="w-4 h-4" />
        });
    }

    // Default Tab Logic
    const defaultTab = canManage ? 'all-patients' : 'my-patients';

    return (
        <PageContainer
            title="Data Pasien"
            subtitle={canManage
                ? "Kelola data induk pasien klinik."
                : "Daftar pasien yang pernah Anda tangani."}
        >
            <Tabs tabs={tabs} defaultTab={defaultTab} variant="pills">

                {/* Tab Semua Pasien */}
                {canManage && (
                    <TabPanel tabId="all-patients">
                        <PatientList scope="all" canManage={true} />
                    </TabPanel>
                )}

                {/* Tab Pasien Saya */}
                {(isDoctor || isHeadClinic) && (
                    <TabPanel tabId="my-patients">
                        {/* Scope 'me' mengirim sinyal filter doctor_id ke komponen */}
                        {/* canManage=false artinya di tab ini dokter tidak bisa edit/hapus sembarangan, hanya view */}
                        <PatientList scope="me" canManage={false} />
                    </TabPanel>
                )}

            </Tabs>
        </PageContainer>
    );
}