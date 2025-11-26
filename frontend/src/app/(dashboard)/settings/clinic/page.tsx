'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { useRole } from '@/core/hooks/auth/useRole';
import CategoryManager from './tabs/CategoryManager';
import TreatmentManager from './tabs/TreatmentManager';

export default function ClinicSettingsPage() {
    const { isKepalaKlinik } = useRole();
    const [activeTab, setActiveTab] = useState('treatments');

    if (!isKepalaKlinik) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center text-red-500">
                        Anda tidak memiliki akses ke halaman ini.
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Manajemen Layanan Klinik"
            subtitle="Atur daftar tindakan, harga, dan kategori layanan di sini."
        >
            <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 bg-white p-1 rounded-lg border border-gray-200 inline-flex">
                    <TabsTrigger value="treatments" className="px-4 py-2">
                        Daftar Layanan & Harga
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="px-4 py-2">
                        Kategori Layanan
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="treatments" tabId="treatments">
                        <TreatmentManager />
                    </TabsContent>

                    <TabsContent value="categories" tabId="categories">
                        <CategoryManager />
                    </TabsContent>
                </div>
            </Tabs>
        </PageContainer>
    );
}