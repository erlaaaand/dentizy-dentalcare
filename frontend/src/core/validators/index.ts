// frontend/src/core/validators/index.ts
import { VALIDATION_MESSAGES, VALIDATION_RULES } from '../constants/validation.constants';

export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

export function isValidEmail(email: string): { valid: boolean; message?: string } {
    const valid = VALIDATION_RULES.EMAIL.PATTERN.test(email);
    return valid
        ? { valid }
        : { valid, message: VALIDATION_MESSAGES.EMAIL_INVALID };
}

export function isValidPhone(phone: string): { valid: boolean, message?: string } {
    const cleaned = phone.replace(/\D/g, '');
    const valid = VALIDATION_RULES.PHONE.PATTERN.test(cleaned);
    return valid
        ? { valid }
        : { valid, message: VALIDATION_MESSAGES.PHONE_INVALID }
}

export function isValidNIK(nik: string): { valid: boolean, message?: string } {
    const cleaned = nik.replace(/\D/g, '');
    const valid = cleaned.length === VALIDATION_RULES.NIK.LENGTH &&
        VALIDATION_RULES.NIK.PATTERN.test(cleaned)
    return valid
        ? { valid }
        : { valid, message: VALIDATION_MESSAGES.NIK_INVALID }
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
): { valid: boolean; message?: string } {
    const {
        minLength = VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true,
    } = options;

    if (password.length < minLength) {
        return { valid: false, message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT };
    }
    if (requireUppercase && !/[A-Z]/.test(password)) {
        return { valid: false, message: VALIDATION_MESSAGES.PASSWORD_WEAK };
    }
    if (requireLowercase && !/[a-z]/.test(password)) {
        return { valid: false, message: VALIDATION_MESSAGES.PASSWORD_WEAK };
    }
    if (requireNumbers && !/\d/.test(password)) {
        return { valid: false, message: VALIDATION_MESSAGES.PASSWORD_WEAK };
    }
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: VALIDATION_MESSAGES.PASSWORD_WEAK };
    }

    return { valid: true };
}

export function getPasswordStrength(password: string): {
    score: number;
    label: 'Sangat Lemah' | 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat';
    message?: string;
} {
    let score = 0;

    if (password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'] as const;
    const normalizedScore = Math.min(Math.floor(score / 1.25), 4);

    const label = labels[normalizedScore];
    const message =
        normalizedScore < 3 ? VALIDATION_MESSAGES.PASSWORD_WEAK : undefined;

    return { score: normalizedScore, label, message };
}

export function validateDate(date: string): { valid: boolean; message?: string } {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return { valid: false, message: VALIDATION_MESSAGES.DATE_INVALID };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return { valid: false, message: VALIDATION_MESSAGES.DATE_INVALID };
    }

    return { valid: true };
}

export function validateTime(time: string): { valid: boolean; message?: string } {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const valid = timeRegex.test(time);
    return valid
        ? { valid }
        : { valid, message: VALIDATION_MESSAGES.TIME_INVALID };
}

export function validateAge(
    birthDate: string,
    minAge = 0,
    maxAge = 150
): { valid: boolean; message?: string } {
    const dateCheck = validateDate(birthDate);
    if (!dateCheck.valid) {
        return { valid: false, message: VALIDATION_MESSAGES.DATE_INVALID };
    }

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    const valid = age >= minAge && age <= maxAge;
    return valid
        ? { valid }
        : { valid, message: VALIDATION_MESSAGES.AGE_INVALID };
}

export function hasRequiredFields<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
): { valid: boolean; message?: string } {
    const missing = requiredFields.filter((field) => {
        const value = obj[field];
        return value === null || value === undefined || value === '';
    });

    if (missing.length > 0) {
        return {
            valid: false,
            message: `${VALIDATION_MESSAGES.REQUIRED_FIELD}: ${missing.join(', ')}`,
        };
    }

    return { valid: true };
}