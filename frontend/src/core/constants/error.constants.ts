export const ERROR_MESSAGES = {
    // Network
    NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
    TIMEOUT: 'Permintaan timeout. Coba lagi.',

    // Auth
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan ini.',
    INVALID_CREDENTIALS: 'Username atau password salah.',

    // Validation
    REQUIRED_FIELD: 'Field ini wajib diisi',
    INVALID_EMAIL: 'Format email tidak valid',
    INVALID_PHONE: 'Format nomor telepon tidak valid',
    INVALID_NIK: 'NIK harus 16 digit',

    PASSWORD_TOO_SHORT: 'Password minimal 8 karakter',
    PASSWORD_MISMATCH: 'Konfirmasi password tidak cocok',

    // Data
    NOT_FOUND: 'Data tidak ditemukan',
    ALREADY_EXISTS: 'Data sudah ada',

    // Operations
    CREATE_FAILED: 'Gagal membuat data',
    UPDATE_FAILED: 'Gagal mengupdate data',
    DELETE_FAILED: 'Gagal menghapus data',
    FETCH_FAILED: 'Gagal mengambil data',

    // Generic
    UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
    SERVER_ERROR: 'Terjadi kesalahan pada server',
} as const;

export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
} as const;