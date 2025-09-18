import api from './axiosInstance';

/**
 * Mengambil daftar pengguna, bisa difilter berdasarkan peran.
 * @param role - Peran pengguna yang ingin diambil (contoh: 'dokter')
 */
export const getUsers = async (role?: 'dokter' | 'staf') => {
    try {
        const params = role ? { role } : {};
        const response = await api.get('/users', { params });
        return response.data;
    } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
        throw error;
    }
};