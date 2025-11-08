'use client';

import React, { useState, useEffect } from 'react';
import { reportService, PatientReportData } from '@/lib/api/reportService';
import { useToastStore } from '@/lib/store/toastStore';
import { ReportCard } from './ReportCard';
import { ChartComponent } from './ChartComponent';
import { Users, UserPlus, Download } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';

interface PatientReportProps {
    startDate: string;
    endDate: string;
}

export function PatientReport({ startDate, endDate }: PatientReportProps) {
    const [data, setData] = useState<PatientReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const { error, success } = useToastStore();

    useEffect(() => {
        if (startDate && endDate) {
            loadReport();
        }
    }, [startDate, endDate]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const reportData = await reportService.getPatientReport({
                startDate,
                endDate,
            });
            setData(reportData);
        } catch (err: any) {
            error(err.message || 'Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await reportService.exportPatientReport({
                startDate,
                endDate,
            });

            reportService.downloadReport(blob, `laporan-pasien-${startDate}-${endDate}.xlsx`);
            success('Laporan berhasil diexport');
        } catch (err: any) {
            error(err.message || 'Gagal export laporan');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Pilih periode untuk melihat laporan</p>
            </div>
        );
    }

    // Prepare chart data
    const genderChartData = [
        { name: 'Laki-laki', value: data.byGender.L },
        { name: 'Perempuan', value: data.byGender.P },
    ];

    const ageGroupChartData = data.byAgeGroup.map(d => ({
        name: d.range,
        value: d.count,
    }));

    const topPatientsData = data.topPatients.map(d => ({
        name: d.patientName,
        value: d.visitCount,
    }));

    return (
        <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    <span>{exporting ? 'Mengexport...' : 'Export Excel'}</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportCard
                    title="Total Pasien"
                    value={formatNumber(data.total)}
                    icon={Users}
                    color="blue"
                />

                <ReportCard
                    title="Pasien Baru"
                    value={formatNumber(data.newPatients)}
                    subtitle="Dalam periode ini"
                    icon={UserPlus}
                    color="green"
                />

                <ReportCard
                    title="Laki-laki / Perempuan"
                    value={`${data.byGender.L} / ${data.byGender.P}`}
                    icon={Users}
                    color="purple"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent
                    type="pie"
                    data={genderChartData}
                    title="Distribusi Jenis Kelamin"
                    height={300}
                />

                <ChartComponent
                    type="bar"
                    data={ageGroupChartData}
                    title="Distribusi Kelompok Usia"
                    height={300}
                />
            </div>

            {topPatientsData.length > 0 && (
                <ChartComponent
                    type="bar"
                    data={topPatientsData}
                    title="Top 10 Pasien dengan Kunjungan Terbanyak"
                    height={300}
                />
            )}
        </div>
    );
}