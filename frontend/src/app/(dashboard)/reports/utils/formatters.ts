// src/app/(dashboard)/reports/utils/formatters.ts

/**
 * Format Date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Subtract days from date
 */
export const subDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

/**
 * Set time to start of day (00:00:00.000)
 */
export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Set time to end of day (23:59:59.999)
 */
export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Format date for display (e.g., "20 Des 2024")
 */
export const formatDisplayDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

/**
 * Format date for chart axis (e.g., "20 Des")
 */
export const formatChartDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Format date for tooltip (e.g., "20 Desember 2024")
 */
export const formatTooltipDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Format number to Rupiah currency
 */
export const formatRp = (val: number | string): string => {
    const numVal = Number(val);
    if (isNaN(numVal)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(numVal);
};

/**
 * Format large numbers to k/M format
 */
export const formatCompactNumber = (val: number): string => {
    const numVal = Number(val);
    if (isNaN(numVal)) return '0';
    
    if (numVal >= 1000000) {
        return `${(numVal / 1000000).toFixed(1)}M`;
    }
    if (numVal >= 1000) {
        return `${(numVal / 1000).toFixed(0)}k`;
    }
    return numVal.toString();
};