// frontend/src/core/constants/error.constants.ts
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
    TIMEOUT: 'Permintaan timeout. Coba lagi.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan ini.',
    INVALID_CREDENTIALS: 'Username atau password salah.',
    REQUIRED_FIELD: 'Field ini wajib diisi',
    INVALID_EMAIL: 'Format email tidak valid',
    INVALID_PHONE: 'Format nomor telepon tidak valid',
    INVALID_NIK: 'NIK harus 16 digit',
    PASSWORD_TOO_SHORT: 'Password minimal 8 karakter',
    PASSWORD_MISMATCH: 'Konfirmasi password tidak cocok',
    NOT_FOUND: 'Data tidak ditemukan',
    ALREADY_EXISTS: 'Data sudah ada',
    CREATE_FAILED: 'Gagal membuat data',
    UPDATE_FAILED: 'Gagal mengupdate data',
    DELETE_FAILED: 'Gagal menghapus data',
    FETCH_FAILED: 'Gagal mengambil data',
    UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
    SERVER_ERROR: 'Terjadi kesalahan pada server',
    VALIDATION_ERROR: 'Terjadi kesalahan dalam validasi data. Mohon periksa kembali informasi yang Anda masukkan dan coba lagi.'
} as const;