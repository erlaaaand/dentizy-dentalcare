// src/app/(dashboard)/reports/hooks/useFinancialReport.ts
import { useState } from 'react';
import { useRevenueReport } from '@/core/services/api/reports.api';
import { formatDate, subDays, startOfDay, endOfDay } from '../utils/formatters';

export const useFinancialReport = () => {
    const today = new Date();
    
    // State untuk date input (UI state)
    const [startDate, setStartDate] = useState(formatDate(subDays(today, 30)));
    const [endDate, setEndDate] = useState(formatDate(today));
    
    // State untuk applied date range (untuk API call)
    const [appliedDateRange, setAppliedDateRange] = useState({
        startDate: subDays(today, 30).toISOString(),
        endDate: today.toISOString()
    });

    // Fetch data dari API
    const { data, isLoading, error } = useRevenueReport({ 
        ...appliedDateRange, 
        groupBy: 'day' 
    });
    
    const chartData = (data as any)?.data || [];

    /**
     * Validate and apply date filter
     */
    const handleApplyFilter = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validasi: end date tidak boleh sebelum start date
        if (end < start) {
            alert('Tanggal akhir tidak boleh lebih awal dari tanggal awal');
            return;
        }
        
        // Validasi: tidak boleh tanggal masa depan
        if (end > today) {
            alert('Tanggal akhir tidak boleh melebihi hari ini');
            return;
        }
        
        setAppliedDateRange({
            startDate: startOfDay(start).toISOString(),
            endDate: endOfDay(end).toISOString()
        });
    };

    /**
     * Quick filter by number of days
     */
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

    /**
     * Calculate total revenue
     */
    const totalRevenue = chartData.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.revenue) || 0);
    }, 0);

    /**
     * Calculate average revenue per day
     */
    const averageRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

    /**
     * Get maximum revenue in period
     */
    const maxRevenue = Math.max(...chartData.map((d: any) => Number(d.revenue) || 0), 0);

    return {
        // Date states
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        appliedDateRange,
        
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
        maxRevenue,
        
        // Utilities
        today: formatDate(today)
    };
};