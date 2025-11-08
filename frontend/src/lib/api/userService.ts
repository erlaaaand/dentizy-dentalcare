import api from './axiosInstance';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, ResetPasswordDto, UserFilters } from '@/types/api';

/**
 * ✅ FIXED: GET /users dengan filter role
 */
export const getUsers = async (params?: UserFilters) => {
    try {
        const response = await api.get('/users', { params });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data pengguna');
    }
};

/**
 * ✅ FIXED: GET /users/:id
 */
export const getUserById = async (id: number) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengambil data user');
    }
};

/**
 * ✅ NEW: POST /users
 */
export const createUser = async (data: CreateUserDto) => {
    try {
        const response = await api.post('/users', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal membuat user baru');
    }
};

/**
 * ✅ FIXED: PATCH /users/:id
 */
export const updateUser = async (id: number, data: UpdateUserDto) => {
    try {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengupdate user');
    }
};

/**
 * ✅ NEW: DELETE /users/:id
 */
export const deleteUser = async (id: number) => {
    try {
        await api.delete(`/users/${id}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal menghapus user');
    }
};

/**
 * ✅ NEW: POST /users/change-password
 */
export const changePassword = async (data: ChangePasswordDto) => {
    try {
        // Validasi di frontend
        if (data.newPassword !== data.confirmPassword) {
            throw new Error('Password baru dan konfirmasi password tidak sama');
        }

        const response = await api.post('/users/change-password', {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword
        });

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengubah password');
    }
};

/**
 * ✅ NEW: POST /users/:id/reset-password
 */
export const resetPassword = async (id: number, data: ResetPasswordDto) => {
    try {
        const response = await api.post(`/users/${id}/reset-password`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal reset password');
    }
};