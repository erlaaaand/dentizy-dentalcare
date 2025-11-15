/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    unauthorized: 'Sesi Anda telah berakhir. Silakan login kembali.',
    forbidden: 'Anda tidak memiliki akses untuk melakukan operasi ini.',
    notFound: 'Data tidak ditemukan.',
    serverError: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    validationError: 'Data yang Anda masukkan tidak valid.',
    conflict: 'Data sudah ada dalam sistem.',
    timeout: 'Permintaan timeout. Silakan coba lagi.',
    unknown: 'Terjadi kesalahan. Silakan coba lagi.'
} as const;