/**
 * Format Utility Functions
 * Provides helper functions for data formatting
 */

/**
 * Format currency (Indonesian Rupiah)
 */
export function formatCurrency(
    amount: number,
    currency = 'IDR',
    locale = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(
    value: number,
    decimals = 0,
    locale = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(
    value: number,
    decimals = 0,
    locale = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
}

/**
 * Format phone number (Indonesian format)
 */
export function formatPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format: 0812-3456-7890 or +62 812-3456-7890
    if (cleaned.startsWith('62')) {
        const match = cleaned.match(/^(\d{2})(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return `+${match[1]} ${match[2]}-${match[3]}-${match[4]}`;
        }
    } else if (cleaned.startsWith('0')) {
        const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileIcon(filename: string): string {
    if (!filename) return 'file';

    const extension = filename.split('.').pop()?.toLowerCase() || '';

    const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const documentExt = ['doc', 'docx', 'odt'];
    const pdfExt = ['pdf'];
    const excelExt = ['xls', 'xlsx', 'csv'];

    if (imageExt.includes(extension)) return 'image';
    if (documentExt.includes(extension)) return 'document';
    if (pdfExt.includes(extension)) return 'pdf';
    if (excelExt.includes(extension)) return 'excel';

    return 'file'; // default icon
}

/**
 * Format duration (seconds to human readable)
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}j`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}d`);

    return parts.join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number, suffix = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Truncate text by words
 */
export function truncateWords(text: string, wordCount: number, suffix = '...'): string {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + suffix;
}

/**
 * Format name to title case
 */
export function formatName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format initials from name
 */
export function getInitials(name: string, maxLength = 2): string {
    const words = name.trim().split(' ');
    const initials = words
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, maxLength);
    return initials;
}


/**
 * Mask sensitive data
 */
export function maskString(
    str: string,
    visibleStart = 4,
    visibleEnd = 4,
    maskChar = '*'
): string {
    if (str.length <= visibleStart + visibleEnd) return str;

    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);

    return start + masked + end;
}

/**
 * Format NIK (Indonesian ID number)
 */
export function formatNIK(nik: string): string {
    const cleaned = nik.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{6})(\d{6})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return nik;
}

/**
 * Format medical record number
 * Expected: YYYYMMDD-XXX (contoh: 20251110-001)
 */
export function formatMedicalRecordNumber(mrn: string): string {
    // Hapus karakter non-angka
    const cleaned = mrn.replace(/\D/g, '');

    // Cek apakah terdiri dari 11 digit (8 tanggal + 3 nomor urut)
    const match = cleaned.match(/^(\d{8})(\d{3})$/);

    if (match) {
        return `${match[1]}-${match[2]}`;
    }

    // Jika format tidak sesuai, kembalikan apa adanya
    return mrn;
}


/**
 * Format address
 */
export function formatAddress(address: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
}): string {
    const parts: string[] = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.postalCode) parts.push(address.postalCode);

    return parts.join(', ');
}

/**
 * Format schedule time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
}

/**
 * Format list of items
 */
export function formatList(
    items: string[],
    locale = 'id-ID',
    type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];

    const formatter = new Intl.ListFormat(locale, {
        style: 'long',
        type
    });

    return formatter.format(items);
}

/**
 * Format compact number (1K, 1M, etc)
 */
export function formatCompactNumber(
    value: number,
    locale = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
}

/**
 * Format ordinal number (1st, 2nd, 3rd)
 */
export function formatOrdinal(num: number, locale = 'id-ID'): string {
    if (locale === 'id-ID') {
        return `${num}`; // Indonesian doesn't have ordinals like English
    }

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Remove HTML tags
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}
