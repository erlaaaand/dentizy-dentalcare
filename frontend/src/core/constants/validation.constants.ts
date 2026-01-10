// frontend/src/core/constants/validation.constants.ts
export const VALIDATION_RULES = {
  NIK: {
    LENGTH: 16,
    PATTERN: /^\d{16}$/,
  },

  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^(\+62|62|0)[0-9]{9,13}$/,
  },

  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },

  USERNAME: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },

  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
} as const;

export const VALIDATION_MESSAGES = {
  DATE_INVALID: 'Tanggal tidak valid',
  TIME_INVALID: 'Waktu tidak valid',
  NIK_INVALID: `NIK harus ${VALIDATION_RULES.NIK.LENGTH} digit`,
  PHONE_INVALID: 'Format nomor telepon tidak valid',
  EMAIL_INVALID: 'Format email tidak valid',
  AGE_INVALID: 'Umur tidak valid',
  PASSWORD_TOO_SHORT: 'Password yang anda tulis terlalu pendek',
  PASSWORD_WEAK: 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  USERNAME_INVALID: 'Username hanya boleh mengandung huruf, angka, dan underscore',
  NAME_TOO_SHORT: `Nama minimal ${VALIDATION_RULES.NAME.MIN_LENGTH} karakter`,
  REQUIRED_FIELD: 'Field ini wajib diisi',
} as const;