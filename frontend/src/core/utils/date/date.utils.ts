/**
 * Date Utility Functions
 * Provides helper functions for date manipulation and formatting
 */

/**
 * Format date to string
 */
export function formatDate(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium',
    locale = 'id-ID'
): string {
    const dateObj = new Date(date);

    const formats: Record<string, Intl.DateTimeFormatOptions> = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        },
    };

    return new Intl.DateTimeFormat(locale, formats[format]).format(dateObj);
}

/**
 * Format time to string
 */
export function formatTime(
    date: Date | string | number,
    format: '12h' | '24h' = '24h',
    locale = 'id-ID'
): string {
    const dateObj = new Date(date);

    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: format === '12h',
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale = 'id-ID'
): string {
    const dateObj = new Date(date);

    const formats: Record<string, Intl.DateTimeFormatOptions> = {
        short: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        },
        medium: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
        long: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        },
    };

    return new Intl.DateTimeFormat(locale, formats[format]).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(
    date: Date | string | number,
    locale = 'id-ID'
): string {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffSec < 60) return rtf.format(-diffSec, 'second');
    if (diffMin < 60) return rtf.format(-diffMin, 'minute');
    if (diffHour < 24) return rtf.format(-diffHour, 'hour');
    if (diffDay < 7) return rtf.format(-diffDay, 'day');
    if (diffWeek < 4) return rtf.format(-diffWeek, 'week');
    if (diffMonth < 12) return rtf.format(-diffMonth, 'month');
    return rtf.format(-diffYear, 'year');
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
    const dateObj = new Date(date);
    const today = new Date();
    return isSameDay(dateObj, today);
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
    const dateObj = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(dateObj, yesterday);
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
    const dateObj = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(dateObj, tomorrow);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(
    date1: Date | string | number,
    date2: Date | string | number
): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
    return new Date(date).getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
    return new Date(date).getTime() > Date.now();
}

/**
 * Add days to date
 */
export function addDays(date: Date | string | number, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Add months to date
 */
export function addMonths(date: Date | string | number, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

/**
 * Add years to date
 */
export function addYears(date: Date | string | number, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string | number): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string | number): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date | string | number): Date {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date | string | number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
}

/**
 * Get difference between two dates in days
 */
export function diffInDays(
    date1: Date | string | number,
    date2: Date | string | number
): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get difference between two dates in hours
 */
export function diffInHours(
    date1: Date | string | number,
    date2: Date | string | number
): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
}

/**
 * Get difference between two dates in minutes
 */
export function diffInMinutes(
    date1: Date | string | number,
    date2: Date | string | number
): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60));
}

/**
 * Get age from birthdate
 */
export function getAge(birthdate: Date | string | number): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date | null {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date | string | number): number {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Get week number
 */
export function getWeekNumber(date: Date | string | number): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
}

/**
 * Format to ISO string (YYYY-MM-DD)
 */
export function toISODate(date: Date | string | number): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Format to ISO DateTime string
 */
export function toISODateTime(date: Date | string | number): string {
    return new Date(date).toISOString();
}