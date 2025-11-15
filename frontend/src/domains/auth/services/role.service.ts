import api from '../../../lib/api/axiosInstance';

/**
 * GET /roles
 */
export const getAllRoles = async () => {
    try {
        const response = await api.get('/roles');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data role');
    }
};

/**
 * GET /roles/:id
 */
export const getRoleById = async (id: number) => {
    try {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data role');
    }
};