/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
    password: {
        minLength: 8,
        maxLength: 50,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
    },
    username: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/
    },
    phone: {
        minLength: 10,
        maxLength: 15,
        pattern: /^(\+62|62|0)[0-9]{9,12}$/
    },
    nik: {
        length: 16,
        pattern: /^\d{16}$/
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
} as const;

/**
 * Regular Expressions
 */
export const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+62|62|0)[0-9]{9,12}$/,
    nik: /^\d{16}$/,
    username: /^[a-zA-Z0-9_]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^\d+$/,
    alphabetic: /^[a-zA-Z]+$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
} as const;