// frontend/src/core/constants/error.constants.ts
export const ERROR_MESSAGES = {
    // Network
    NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
    TIMEOUT: 'Permintaan timeout. Coba lagi.',

    // Auth & Permission
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan ini.',
    INVALID_CREDENTIALS: 'Username atau password salah.',
    INVALID_TOKEN: 'Token tidak valid atau sudah kadaluarsa.',
    SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',

    // Validation
    REQUIRED_FIELD: 'Field ini wajib diisi',
    INVALID_EMAIL: 'Format email tidak valid',
    INVALID_PHONE: 'Format nomor telepon tidak valid',
    INVALID_NIK: 'NIK harus 16 digit',
    PASSWORD_TOO_SHORT: 'Password minimal 8 karakter',
    PASSWORD_MISMATCH: 'Konfirmasi password tidak cocok',
    VALIDATION_ERROR: 'Terjadi kesalahan dalam validasi data. Mohon periksa kembali informasi yang Anda masukkan dan coba lagi.',

    // CRUD / Resource
    NOT_FOUND: 'Data tidak ditemukan',
    ALREADY_EXISTS: 'Data sudah ada',
    CONFLICT: 'Terjadi konflik data',
    CREATE_FAILED: 'Gagal membuat data',
    UPDATE_FAILED: 'Gagal mengupdate data',
    DELETE_FAILED: 'Gagal menghapus data',
    FETCH_FAILED: 'Gagal mengambil data',
    METHOD_NOT_ALLOWED: 'Metode HTTP tidak diizinkan untuk endpoint ini.',
    UNSUPPORTED_MEDIA_TYPE: 'Format data yang dikirim tidak didukung.',
    PAYLOAD_TOO_LARGE: 'Data yang dikirim terlalu besar.',
    TOO_MANY_REQUESTS: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    GONE: 'Resource yang diminta sudah tidak tersedia.',

    // Server
    UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
    SERVER_ERROR: 'Terjadi kesalahan pada server',
    BAD_GATEWAY: 'Server menerima respon tidak valid dari upstream.',
    SERVICE_UNAVAILABLE: 'Layanan sementara tidak tersedia.',
    GATEWAY_TIMEOUT: 'Server tidak merespons dalam waktu yang ditentukan.',

    // Legal
    UNAVAILABLE_FOR_LEGAL_REASONS: 'Data tidak tersedia karena alasan hukum.',
} as const;