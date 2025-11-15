import api from './axiosInstance';

/**
 * GET /notifications
 * Hanya untuk STAF dan KEPALA_KLINIK
 */
export const getAllNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil notifikasi');
    }
};