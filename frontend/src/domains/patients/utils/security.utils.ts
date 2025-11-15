export const sanitizeString = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 255);
};

export const sanitizeFilters = (filters: any): any => {
    const sanitized: any = {};

    if (filters.jenis_kelamin && ['L', 'P'].includes(filters.jenis_kelamin)) {
        sanitized.jenis_kelamin = filters.jenis_kelamin;
    }

    if (filters.umur_min !== undefined) {
        const age = parseInt(String(filters.umur_min), 10);
        if (!isNaN(age) && age >= 0 && age <= 150) {
            sanitized.umur_min = age;
        }
    }

    if (filters.umur_max !== undefined) {
        const age = parseInt(String(filters.umur_max), 10);
        if (!isNaN(age) && age >= 0 && age <= 150) {
            sanitized.umur_max = age;
        }
    }

    if (filters.tanggal_daftar_dari) {
        const date = new Date(filters.tanggal_daftar_dari);
        if (!isNaN(date.getTime())) {
            sanitized.tanggal_daftar_dari = filters.tanggal_daftar_dari;
        }
    }

    if (filters.tanggal_daftar_sampai) {
        const date = new Date(filters.tanggal_daftar_sampai);
        if (!isNaN(date.getTime())) {
            sanitized.tanggal_daftar_sampai = filters.tanggal_daftar_sampai;
        }
    }

    return sanitized;
};

export const validateSortConfig = (config: any): boolean => {
    if (!config) return false;

    const allowedFields = ['nama_lengkap', 'nomor_rekam_medis', 'tanggal_lahir', 'created_at'];
    const allowedDirections = ['asc', 'desc'];

    return allowedFields.includes(config.field) &&
        allowedDirections.includes(config.direction);
};