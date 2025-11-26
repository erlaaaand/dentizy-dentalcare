'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { useRole } from '@/core/hooks/auth/useRole';
import { Stethoscope, FolderOpen } from 'lucide-react';
import CategoryManager from './tabs/CategoryManager';
import TreatmentManager from './tabs/TreatmentManager';

export default function ClinicSettingsPage() {
    const { isKepalaKlinik } = useRole();

    if (!isKepalaKlinik) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Akses Ditolak</h3>
                            <p className="text-gray-600">
                                Anda tidak memiliki akses ke halaman ini. Halaman ini hanya dapat diakses oleh Kepala Klinik.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    const tabs = [
        {
            id: 'treatments',
            label: 'Daftar Layanan & Harga',
            icon: <Stethoscope className="w-4 h-4" />
        },
        {
            id: 'categories',
            label: 'Kategori Layanan',
            icon: <FolderOpen className="w-4 h-4" />
        }
    ];

    return (
        <PageContainer
            title="Manajemen Layanan Klinik"
            subtitle="Atur daftar tindakan, harga, dan kategori layanan di sini."
        >
            <Tabs
                tabs={tabs}
                defaultTab="treatments"
                variant="pills"
            >
                <TabPanel tabId="treatments">
                    <TreatmentManager />
                </TabPanel>

                <TabPanel tabId="categories">
                    <CategoryManager />
                </TabPanel>
            </Tabs>
        </PageContainer>
    );
}