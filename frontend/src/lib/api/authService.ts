import api from './axiosInstance';
import Cookies from 'js-cookie';

interface LoginDto {
    username: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        nama_lengkap: string;
        roles: string[];
    };
}

/**
 * Login user dan simpan token ke localStorage & cookies
 */
export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login', credentials);

        if (response.data?.access_token) {
            const token = response.data.access_token;
            
            // Simpan ke localStorage (untuk client-side access)
            localStorage.setItem('access_token', token);
            
            // Simpan ke cookies (untuk middleware)
            const isProduction = process.env.NODE_ENV === 'production';
            Cookies.set('access_token', token, { 
                expires: 1, // 1 hari
                secure: isProduction, // HTTPS only di production
                sameSite: 'strict' // CSRF protection
            });

            // Optional: Simpan user info
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    } catch (error: any) {
        console.error('Login failed:', error);
        
        // Enhance error message
        if (error.response?.status === 401) {
            throw new Error('Username atau password salah');
        } else if (error.response?.status === 403) {
            throw new Error('Akun Anda tidak memiliki akses');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Silakan coba lagi nanti');
        } else if (!error.response) {
            throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda');
        }
        
        throw error;
    }
};

/**
 * Logout user dan hapus semua data autentikasi
 */
export const logout = () => {
    try {
        // Hapus dari localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Hapus dari cookies
        Cookies.remove('access_token');
        
        // Redirect ke login
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if error
        window.location.href = '/login';
    }
};

/**
 * Cek apakah user sudah login
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('access_token');
    const cookieToken = Cookies.get('access_token');
    return !!(token || cookieToken);
};

/**
 * Dapatkan user info dari localStorage
 */
export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Get profile from backend (optional - jika ada endpoint)
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        
        // Update localStorage dengan data terbaru
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        
        return response.data;
    } catch (error) {
        console.error('Failed to get profile:', error);
        throw error;
    }
};

/**
 * Refresh token (jika backend support refresh token)
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