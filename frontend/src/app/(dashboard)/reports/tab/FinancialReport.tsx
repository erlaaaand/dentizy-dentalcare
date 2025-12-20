// src/components/financial-report/index.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { useFinancialReport } from '../hooks/useFinancialReport';
import { generateFinancialReportPDF } from '../utils/pdf-generator';
import { FilterSection } from '../components/FilterSection';
import { SummaryCards } from '../components/SummaryCards';
import { RevenueChart } from '../components/RevenueChart';

interface User {
    fullName?: string;
    name?: string;
    email?: string;
}

interface FinancialReportProps {
    currentUser?: User;
}

export default function FinancialReport({ currentUser }: FinancialReportProps) {
    const { 
        startDate, setStartDate,
        endDate, setEndDate,
        appliedDateRange,
        handleApplyFilter,
        handleQuickFilter,
        chartData,
        isLoading,
        error
    } = useFinancialReport();

    // Kalkulasi Total di sini atau di hook (opsional)
    const totalRevenue = chartData.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.revenue) || 0);
    }, 0);

    const handleExport = () => {
        generateFinancialReportPDF({
            chartData,
            startDate: appliedDateRange.startDate,
            endDate: appliedDateRange.endDate,
            totalRevenue,
            userName: currentUser?.fullName || currentUser?.name || 'Admin'
        });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-600 p-10">Error loading data</div>;

    return (
        <div className="space-y-6">
            <FilterSection
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApplyFilter}
                onQuickFilter={handleQuickFilter}
                onExport={handleExport}
                hasData={chartData.length > 0}
            />

            <SummaryCards 
                totalRevenue={totalRevenue}
                chartData={chartData}
                dateRange={appliedDateRange}
            />

            <RevenueChart data={chartData} />
        </div>
    );
}