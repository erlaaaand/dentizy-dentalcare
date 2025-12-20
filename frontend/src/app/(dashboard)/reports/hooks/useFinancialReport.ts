// src/components/financial-report/hooks/useFinancialReport.ts
import { useState } from 'react';
import { useRevenueReport } from '@/core/services/api/reports.api';
import { formatDate, subDays, startOfDay, endOfDay } from '../utils/formatters';

export const useFinancialReport = () => {
    const today = new Date();
    
    // State UI Input
    const [startDate, setStartDate] = useState(formatDate(subDays(today, 30)));
    const [endDate, setEndDate] = useState(formatDate(today));
    
    // State API Parameter
    const [appliedDateRange, setAppliedDateRange] = useState({
        startDate: subDays(today, 30).toISOString(),
        endDate: today.toISOString()
    });

    // Fetch Data
    const { data, isLoading, error } = useRevenueReport({ 
        ...appliedDateRange, 
        groupBy: 'day' 
    });
    
    const chartData = (data as any)?.data || [];

    // Logic Validasi & Apply
    const handleApplyFilter = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            alert('Tanggal akhir tidak boleh lebih awal dari tanggal awal');
            return;
        }
        if (end > today) {
            alert('Tanggal akhir tidak boleh melebihi hari ini');
            return;
        }
        
        setAppliedDateRange({
            startDate: startOfDay(start).toISOString(),
            endDate: endOfDay(end).toISOString()
        });
    };

    const handleQuickFilter = (days: number) => {
        const end = new Date();
        const start = subDays(end, days);
        
        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
        setAppliedDateRange({
            startDate: startOfDay(start).toISOString(),
            endDate: endOfDay(end).toISOString()
        });
    };

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        appliedDateRange,
        handleApplyFilter,
        handleQuickFilter,
        chartData,
        isLoading,
        error
    };
};