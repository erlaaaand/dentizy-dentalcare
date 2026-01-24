/**
 * Validation Utility Functions
 * Provides helper functions for data validation
 */

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

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
export function isValidPhone(phone: string): boolean {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if starts with 0 or 62 and has correct length
    const startsWithZero = /^0\d{9,12}$/.test(cleaned);
    const startsWithSixTwo = /^62\d{9,12}$/.test(cleaned);

    return startsWithZero || startsWithSixTwo;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validate Indonesian NIK (16 digits)
 */
export function isValidNIK(nik: string): boolean {
    const cleaned = nik.replace(/\D/g, '');
    return /^\d{16}$/.test(cleaned);
}

/**
 * Validate password strength
 */
export function isStrongPassword(
    password: string,
    options: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
    } = {}
): boolean {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true,
    } = options;

    if (password.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/\d/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
    score: number;
    label: 'Sangat Lemah' | 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat';
} {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'] as const;
    const normalizedScore = Math.min(Math.floor(score / 1.25), 4);

    return {
        score: normalizedScore,
        label: labels[normalizedScore],
    };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTime(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

/**
 * Validate age (birth date)
 */
export function isValidAge(birthDate: string, minAge = 0, maxAge = 150): boolean {
    if (!isValidDate(birthDate)) return false;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age >= minAge && age <= maxAge;
}

/**
 * Validate username
 */
export function isValidUsername(
    username: string,
    minLength = 3,
    maxLength = 20
): boolean {
    if (username.length < minLength || username.length > maxLength) return false;
    return /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function isValidFileType(
    file: File,
    allowedTypes: string[]
): boolean {
    return allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
    });
}

/**
 * Validate image file
 */
export function isValidImage(file: File, maxSizeMB = 5): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return isValidFileType(file, imageTypes) && isValidFileSize(file, maxSizeMB);
}

/**
 * Validate number range
 */
export function isInRange(
    value: number,
    min: number,
    max: number,
    inclusive = true
): boolean {
    if (inclusive) {
        return value >= min && value <= max;
    }
    return value > min && value < max;
}

/**
 * Validate positive number
 */
export function isPositive(value: number): boolean {
    return value > 0;
}

/**
 * Validate negative number
 */
export function isNegative(value: number): boolean {
    return value < 0;
}

/**
 * Validate integer
 */
export function isInteger(value: number): boolean {
    return Number.isInteger(value);
}

/**
 * Validate array with minimum length
 */
export function hasMinLength<T>(array: T[], minLength: number): boolean {
    return array.length >= minLength;
}

/**
 * Validate array with maximum length
 */
export function hasMaxLength<T>(array: T[], maxLength: number): boolean {
    return array.length <= maxLength;
}

/**
 * Validate required fields in object
 */
export function hasRequiredFields<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
): boolean {
    return requiredFields.every((field) => {
        const value = obj[field];
        return value !== null && value !== undefined && value !== '';
    });
}

/**
 * Validate gender
 */
export function isValidGender(gender: string): boolean {
    const validGenders = ['L', 'P', 'LAKI-LAKI', 'PEREMPUAN', 'MALE', 'FEMALE'];
    return validGenders.includes(gender.toUpperCase());
}

/**
 * Validate medical record number format
 * Format: YYYYMMDD-XXX (contoh: 20251110-001)
 */
export function isValidMedicalRecordNumber(mrn: string): boolean {
    return /^\d{8}-\d{3}$/.test(mrn);
}

/**
 * Validate appointment time slot
 */
export function isValidTimeSlot(
    startTime: string,
    endTime: string,
    minDurationMinutes = 15
): boolean {
    if (!isValidTime(startTime) || !isValidTime(endTime)) return false;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes && endMinutes - startMinutes >= minDurationMinutes;
}

/**
 * Validate future date
 */
export function isFutureDate(date: string): boolean {
    if (!isValidDate(date)) return false;
    return new Date(date) > new Date();
}

/**
 * Validate past date
 */
export function isPastDate(date: string): boolean {
    if (!isValidDate(date)) return false;
    return new Date(date) < new Date();
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
    if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
    return new Date(startDate) <= new Date(endDate);
}

/**
 * Sanitize HTML input
 */
export function sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Validate JSON string
 */
export function isValidJson(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

/**
 * Validate IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every((part) => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
    });
}

/**
 * Create validation schema
 */
export function createValidator<T>(
    rules: Partial<Record<keyof T, (value: unknown) => boolean | string>>
) {
    return (data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
        const errors: Partial<Record<keyof T, string>> = {};

        for (const key in rules) {
            const rule = rules[key];
            if (rule) {
                const result = rule(data[key]);
                if (result !== true) {
                    errors[key] = typeof result === 'string' ? result : 'Validasi gagal';
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };
}