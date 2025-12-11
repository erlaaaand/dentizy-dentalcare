// frontend/src/core/validators/index.ts
import { VALIDATION_MESSAGES, VALIDATION_RULES } from '../constants/validation.constants';

export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

export function isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL.PATTERN.test(email);
}

export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return VALIDATION_RULES.PHONE.PATTERN.test(cleaned);
}

export function isValidNIK(nik: string): boolean {
    const cleaned = nik.replace(/\D/g, '');
    return (
        cleaned.length === VALIDATION_RULES.NIK.LENGTH &&
        VALIDATION_RULES.NIK.PATTERN.test(cleaned)
    );
}

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
        minLength = VALIDATION_RULES.PASSWORD.MIN_LENGTH,
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

export function getPasswordStrength(password: string): {
    score: number;
    label: 'Sangat Lemah' | 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat';
} {
    let score = 0;

    if (password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH) score++;
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

export function isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
}

export function isValidTime(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}

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

export function hasRequiredFields<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
): boolean {
    return requiredFields.every((field) => {
        const value = obj[field];
        return value !== null && value !== undefined && value !== '';
    });
}
