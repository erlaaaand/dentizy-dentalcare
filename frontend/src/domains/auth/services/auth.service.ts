import api from '../../../lib/api/axiosInstance';
import Cookies from 'js-cookie';
import { LoginDto, LoginResponse } from '@/core/types/api';

/**
 * ✅ FIXED: Login sesuai backend POST /auth/login
 */
export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login', credentials);

        if (response.data?.access_token) {
            const token = response.data.access_token;

            localStorage.setItem('access_token', token);

            const isProduction = process.env.NODE_ENV === 'production';
            Cookies.set('access_token', token, {
                expires: 1,
                secure: isProduction,
                sameSite: 'strict'
            });

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    } catch (error: any) {
        console.error('Login failed:', error);

        if (error.response?.status === 401) {
            throw new Error('Username atau password salah');
        }

        throw new Error(error.response?.data?.message || 'Login gagal');
    }
};

/**
 * ✅ FIXED: Refresh token sesuai backend POST /auth/refresh
 */
export const refreshToken = async (): Promise<string | null> => {
    try {
        const response = await api.post('/auth/refresh');

        if (response.data?.access_token) {
            const token = response.data.access_token;
            localStorage.setItem('access_token', token);
            Cookies.set('access_token', token, { expires: 1 });
            return token;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return null;
    }
};

/**
 * ✅ Verify token - POST /auth/verify
 */
export const verifyToken = async (token: string) => {
    try {
        const response = await api.post('/auth/verify', { token });
        return response.data;
    } catch (error) {
        throw new Error('Token tidak valid');
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    Cookies.remove('access_token');
    window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
    return !!(localStorage.getItem('access_token') || Cookies.get('access_token'));
};

export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        return null;
    }
};