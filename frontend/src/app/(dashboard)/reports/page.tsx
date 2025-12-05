'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { BarChart3, Users, Activity } from 'lucide-react';
import { ROLES, useAuth } from '@/core';
import { useRouter } from 'next/navigation';

// Components
import FinancialReport from './components/FinancialReport';
import DoctorPerformance from './components/DoctorPerformance';
import TreatmentAnalytics from './components/TreatmentAnalytics';

export default function ReportsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) return null;

    // RBAC: Hanya Kepala Klinik & Staff (Dokter mungkin tidak butuh akses keuangan)
    const userRoles = user?.roles?.map((r: any) => r.name) || [];
    const hasAccess = userRoles.includes(ROLES.KEPALA_KLINIK) || userRoles.includes(ROLES.STAF);

    if (!hasAccess) {
        router.push('/dashboard');
        return null;
    }

    const tabs = [
        { id: 'financial', label: 'Laporan Keuangan', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'doctors', label: 'Kinerja Dokter', icon: <Users className="w-4 h-4" /> },
        { id: 'treatments', label: 'Analisis Layanan', icon: <Activity className="w-4 h-4" /> },
    ];

    return (
        <PageContainer 
            title="Laporan & Analitik" 
            subtitle="Pantau performa klinik, keuangan, dan efektivitas layanan."
        >
            <Tabs tabs={tabs} defaultTab="financial" variant="pills">
                
                <TabPanel tabId="financial">
                    <FinancialReport />
                </TabPanel>

                <TabPanel tabId="doctors">
                    <DoctorPerformance />
                </TabPanel>

                <TabPanel tabId="treatments">
                    <TreatmentAnalytics />
                </TabPanel>

            </Tabs>
        </PageContainer>
    );
}