// src/app/(dashboard)/reports/tab/FinancialReport.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { useFinancialReport } from '../hooks/useFinancialReport';
import { generateFinancialReportPDF } from '../utils/pdf-generator';
import { FilterSection } from '../components/FilterSection';
import { SummaryCards } from '../components/SummaryCards';
import { RevenueChart } from '../components/RevenueChart';

interface AuthUser {
    nama_lengkap?: string;
}

interface FinancialReportProps {
    currentUser?: AuthUser | null | undefined;
}

export default function FinancialReport({ currentUser }: FinancialReportProps) {
    const {
        // Date states
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        appliedDateRange,
        today,

        // Handlers
        handleApplyFilter,
        handleQuickFilter,

        // Data
        chartData,
        isLoading,
        error,

        // Calculations
        totalRevenue,
        averageRevenue,
        maxRevenue
    } = useFinancialReport();

    const userNameDisplay = currentUser?.nama_lengkap || 'Admin';

    /**
     * Handle PDF export
     */
    const handleExportPDF = () => {
        generateFinancialReportPDF({
            chartData,
            startDate: appliedDateRange.startDate,
            endDate: appliedDateRange.endDate,
            totalRevenue,
            averageRevenue,
            maxRevenue,
            userName: userNameDisplay
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
                <p className="text-gray-600">Memuat data laporan...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-16">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-lg font-semibold text-red-600 mb-2">Gagal memuat data</p>
                <p className="text-sm text-gray-600">Silakan refresh halaman atau coba beberapa saat lagi</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <FilterSection
                startDate={startDate}
                endDate={endDate}
                maxDate={today}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApplyFilter}
                onQuickFilter={handleQuickFilter}
                onExport={handleExportPDF}
                hasData={chartData.length > 0}
            />

            {/* Summary Cards */}
            <SummaryCards
                totalRevenue={totalRevenue}
                averageRevenue={averageRevenue}
                maxRevenue={maxRevenue}
                totalDays={chartData.length}
                dateRange={appliedDateRange}
            />

            {/* Revenue Chart */}
            <RevenueChart data={chartData} />
        </div>
    );
}