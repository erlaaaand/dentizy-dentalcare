'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabPanel } from '@/components/ui/navigation/Tabs';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { Calendar, Inbox, Loader2, ShieldAlert, Users, CalendarCheck } from 'lucide-react';
import AppointmentList from './tabs/AppointmentList';
import VerificationManager from './tabs/VerificationManager';
import PatientBookingManager from './tabs/PatientBookingManager';
import { ROLES, useAuth } from '@/core';

export default function AppointmentsPage() {
    const { user, loading: authLoading } = useAuth();

    const userRoles = user?.roles?.map((r: { name: string }) => r.name) || [];
    const isHeadClinic = userRoles.includes(ROLES.KEPALA_KLINIK); // Cek spesifik Kepala Klinik
    const isHeadOrStaff = isHeadClinic || userRoles.includes(ROLES.STAF);
    const isDoctor = userRoles.includes(ROLES.DOKTER);

    const hasAccess = isHeadOrStaff || isDoctor;

    if (authLoading) {
        return (
            <PageContainer title="Jadwal Kunjungan">
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

    // KONFIGURASI TABS
    const tabs = [];

    // [LOGIC TAB APPOINTMENT]
    if (isHeadClinic) {
        // Kepala Klinik dapat 2 Tab: Punya Sendiri & Semua
        tabs.push(
            {
                id: 'my-appointments',
                label: 'Jadwal Saya',
                icon: <Calendar className="w-4 h-4" />
            },
            {
                id: 'all-appointments',
                label: 'Semua Jadwal',
                icon: <CalendarCheck className="w-4 h-4" />
            }
        );
    } else {
        // Dokter Biasa / Staf -> 1 Tab Utama
        tabs.push({
            id: 'appointments',
            label: isDoctor ? 'Jadwal Saya' : 'Semua Jadwal',
            icon: <Calendar className="w-4 h-4" />
        });
    }

    // Tab Khusus Manajemen (Inbox Verifikasi & Pendaftaran Walk-in)
    if (isHeadOrStaff) {
        tabs.push({
            id: 'verification',
            label: 'Permintaan Masuk',
            icon: <Inbox className="w-4 h-4" />
        });

        tabs.push({
            id: 'walkin',
            label: 'Pendaftaran Walk-in',
            icon: <Users className="w-4 h-4" />
        });
    }

    return (
        <PageContainer
            title="Manajemen Pelayanan"
            subtitle={isDoctor
                ? "Kelola antrian pasien dan rekam medis Anda."
                : "Pusat pengelolaan jadwal dokter, verifikasi, dan pendaftaran pasien."}
        >
            <Tabs tabs={tabs} defaultTab={isHeadClinic ? "my-appointments" : "appointments"} variant="pills">

                {/* 1. TAB APPOINTMENT DEFAULT (Dokter / Staf) */}
                {!isHeadClinic && (
                    <TabPanel tabId="appointments">
                        {/* Jika Dokter -> scope='me', Jika Staf -> scope='all' */}
                        <AppointmentList scope={isDoctor ? 'me' : 'all'} />
                    </TabPanel>
                )}

                {/* 2. TAB KEPALA KLINIK: My Appointments */}
                {isHeadClinic && (
                    <TabPanel tabId="my-appointments">
                        <AppointmentList scope="me" />
                    </TabPanel>
                )}

                {/* 3. TAB KEPALA KLINIK: All Appointments */}
                {isHeadClinic && (
                    <TabPanel tabId="all-appointments">
                        <AppointmentList scope="all" />
                    </TabPanel>
                )}

                {/* 4. TAB MANAGEMEN (Head & Staf) */}
                {isHeadOrStaff && (
                    <TabPanel tabId="verification">
                        <VerificationManager />
                    </TabPanel>
                )}

                {isHeadOrStaff && (
                    <TabPanel tabId="walkin">
                        <PatientBookingManager />
                    </TabPanel>
                )}
            </Tabs>
        </PageContainer>
    );
}