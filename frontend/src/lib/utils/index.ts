import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Merge Tailwind classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ============================================
// DATE & TIME UTILITIES
// ============================================

/**
 * Format date string to Indonesian locale
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        
        if (isNaN(date.getTime())) {
            return '-';
        }

        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };

        return date.toLocaleDateString('id-ID', defaultOptions);
    } catch {
        return '-';
    }
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(dateString: string | Date): string {
    return formatDate(dateString, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Format time string (HH:mm:ss) to (HH:mm)
 */
export function formatTime(timeString: string): string {
    try {
        if (!timeString || !timeString.includes(':')) {
            return timeString || '-';
        }
        return timeString.substring(0, 5);
    } catch {
        return '-';
    }
}

/**
 * Format datetime to Indonesian locale
 */
export function formatDateTime(dateTimeString: string | Date): string {
    try {
        const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
        
        if (isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '-';
    }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if date is in the past
 */
export function isPastDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// ============================================
// CURRENCY & NUMBER UTILITIES
// ============================================

/**
 * Format number to Indonesian currency (IDR)
 */
export function formatCurrency(amount: number): string {
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    } catch {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
    if (!name) return '?';
    
    const words = name.trim().split(/\s+/);
    
    if (words.length === 1) {
        return name.substring(0, maxLength).toUpperCase();
    }
    
    return words
        .slice(0, maxLength)
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Validate NIK (Indonesian ID Number) - 16 digits
 */
export function isValidNIK(nik: string): boolean {
    return /^\d{16}$/.test(nik);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

// ============================================
// OBJECT UTILITIES
// ============================================

/**
 * Remove empty values from object (null, undefined, empty string)
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            acc[key as keyof T] = value;
        }
        return acc;
    }, {} as Partial<T>);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare two objects for equality
 */
export function isEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Remove duplicates from array
 */
export function uniqueArray<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

/**
 * Group array by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const groupKey = String(item[key]);
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...arr].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

// ============================================
// ASYNC UTILITIES
// ============================================

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await delay(baseDelay * Math.pow(2, i));
            }
        }
    }
    
    throw lastError!;
}

// ============================================
// BROWSER UTILITIES
// ============================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

// ============================================
// STATUS & BADGE UTILITIES
// ============================================

/**
 * Get status badge color classes
 */
export function getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
        dijadwalkan: 'bg-blue-100 text-blue-800 border-blue-200',
        selesai: 'bg-green-100 text-green-800 border-green-200',
        dibatalkan: 'bg-red-100 text-red-800 border-red-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        aktif: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        nonaktif: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get gender label
 */
export function getGenderLabel(gender?: 'L' | 'P'): string {
    if (!gender) return '-';
    return gender === 'L' ? 'Laki-laki' : 'Perempuan';
}

/**
 * Get role label
 */
export function getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
        kepala_klinik: 'Kepala Klinik',
        dokter: 'Dokter',
        staf: 'Staf'
    };
    return roleMap[role] || role;
}