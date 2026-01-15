import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'dd MMMM yyyy'): string {
    if (!date) return '-';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '-';
        return format(dateObj, formatStr, { locale: id });
    } catch {
        return '-';
    }
}

export function formatTime(time: string | null | undefined, formatStr: string = 'HH:mm'): string {
    if (!time) return '-';
    try {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    } catch {
        return '-';
    }
}

export function formatDateTime(datetime: string | Date | null | undefined): string {
    if (!datetime) return '-';
    try {
        const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
        if (!isValid(dateObj)) return '-';
        return format(dateObj, 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch {
        return '-';
    }
}

export function calculateAge(birthDate: string | Date | null | undefined): number | null {
    if (!birthDate) return null;
    try {
        const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
        if (!isValid(dateObj)) return null;
        const today = new Date();
        let age = today.getFullYear() - dateObj.getFullYear();
        const monthDiff = today.getMonth() - dateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
}

export function formatAge(birthDate: string | Date | null | undefined): string {
    const age = calculateAge(birthDate);
    if (age === null) return '-';
    return `${age} tahun`;
}

export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
}

export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '-';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '-';
    
    let normalized = digits;
    if (normalized.startsWith('0')) {
        normalized = '62' + normalized.slice(1);
    } else if (!normalized.startsWith('62')) {
        normalized = '62' + normalized;
    }
    
    const formatted = normalized
        .replace(/^62(\d{3,4})(\d{3,4})(\d{0,4})$/, '+62 $1 $2 $3')
        .trim();
    
    return formatted;
}

export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function capitalizeWords(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function getInitials(name: string | null | undefined): string {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getGenderLabel(gender: string | null | undefined): string {
    if (!gender) return '-';
    const normalized = gender.trim().toLowerCase();
    switch (normalized) {
        case 'l':
        case 'male':
        case 'laki-laki':
            return 'Laki-laki';
        case 'p':
        case 'female':
        case 'perempuan':
            return 'Perempuan';
        default:
            return '-';
    }
}

export function toInputDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';
        return format(dateObj, 'yyyy-MM-dd');
    } catch {
        return '';
    }
}

export function toInputTime(time: string | null | undefined): string {
    if (!time) return '';
    try {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
        return '';
    }
}