'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { Users, ShieldAlert, Loader2, Stethoscope, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROLES, useAuth } from '@/core';

import UserList from './tabs/UserList';

export default function UserManagementPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <PageContainer title="Manajemen Pengguna">
                <Card><CardBody className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" /></CardBody></Card>
            </PageContainer>
        );
    }

    // RBAC: Hanya Kepala Klinik
    const userRoles =
        user?.roles
            ?.map((r) => (r as { name?: string }).name)
            .filter((name): name is string => Boolean(name)) || [];

    const isHeadClinic = userRoles.includes(ROLES.KEPALA_KLINIK);

    if (!isHeadClinic) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center flex flex-col items-center">
                        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">Area Terbatas</h3>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Halaman manajemen pengguna hanya dapat diakses oleh Kepala Klinik.
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

    // Konfigurasi Tabs
    const tabs = [
        { id: 'all', label: 'Semua Pengguna', icon: <Users className="w-4 h-4" /> },
        { id: 'dokter', label: 'Dokter', icon: <Stethoscope className="w-4 h-4" /> },
        { id: 'staf', label: 'Staf & Admin', icon: <Briefcase className="w-4 h-4" /> },
    ];

    return (
        <PageContainer
            title="Manajemen Pengguna"
            subtitle="Kelola akun, hak akses, dan data dokter serta staf klinik."
        >
            <Tabs tabs={tabs} defaultTab="all" variant="pills">

                <TabPanel tabId="all">
                    <UserList roleFilter="all" />
                </TabPanel>

                <TabPanel tabId="dokter">
                    <UserList roleFilter="dokter" />
                </TabPanel>

                <TabPanel tabId="staf">
                    <UserList roleFilter="staf" />
                </TabPanel>

            </Tabs>
        </PageContainer>
    );
}