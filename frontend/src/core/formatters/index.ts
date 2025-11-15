import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date string to readable format
 */
export function formatDate(date: string | Date | null | undefined, formatStr: string = 'dd MMMM yyyy'): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '-';

    return format(dateObj, formatStr, { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Format time string to readable format
 */
export function formatTime(time: string | null | undefined, formatStr: string = 'HH:mm'): string {
  if (!time) return '-';

  try {
    // Handle HH:mm:ss format
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
}

/**
 * Format datetime string to readable format
 */
export function formatDateTime(datetime: string | Date | null | undefined): string {
  if (!datetime) return '-';

  try {
    const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;

    if (!isValid(dateObj)) return '-';

    return format(dateObj, 'dd MMMM yyyy, HH:mm', { locale: id });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-';
  }
}

/**
 * Calculate age from birth date
 */
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
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Format age with text
 */
export function formatAge(birthDate: string | Date | null | undefined): string {
  const age = calculateAge(birthDate);

  if (age === null) return '-';

  return `${age} tahun`;
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separator
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';

  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format nomor telepon Indonesia menjadi format internasional yang rapi.
 * Contoh hasil:
 * - 08123456789  → +62 812 3456 789
 *
 * @param phone Nomor telepon (string, bisa null/undefined)
 * @returns Nomor yang sudah diformat atau '-' jika tidak valid
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';

  // Hapus semua karakter selain angka
  const digits = phone.replace(/\D/g, '');

  // Jika kosong setelah dibersihkan
  if (!digits) return '-';

  let normalized = digits;

  // Normalisasi ke format internasional (tanpa awalan 0)
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.slice(1);
  } else if (!normalized.startsWith('62')) {
    // Jika tidak ada kode negara dan tidak diawali 0, tambahkan +62 secara default
    normalized = '62' + normalized;
  }

  // Format hasilnya jadi +62 XXX XXXX XXX atau mirip sesuai panjang
  const formatted = normalized
    .replace(/^62(\d{3,4})(\d{3,4})(\d{0,4})$/, '+62 $1 $2 $3')
    .trim();

  return formatted;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '-';

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get initials from name
 */
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

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert date to input format (YYYY-MM-DD)
 */
export function toInputDate(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '';

    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting to input date:', error);
    return '';
  }
}

/**
 * Convert time to input format (HH:mm)
 */
export function toInputTime(time: string | null | undefined): string {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting to input time:', error);
    return '';
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) return '-';

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay < 7) return `${diffDay} hari yang lalu`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '-';
  }
}