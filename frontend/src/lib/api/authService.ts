import api from './axiosInstance';
import Cookies from 'js-cookie';

interface LoginDto {
    username: string;
    password: string;
}

export const login = async (credentials: LoginDto) => {
    try {
        const response = await api.post('/auth/login', credentials);

        if (response.data.access_token) {
            const token = response.data.access_token;
            localStorage.setItem('access_token', response.data.access_token);
            Cookies.set('access_token', token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
        }

        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  Cookies.remove('access_token');
  window.location.href = '/login';
};

// Anda bisa tambahkan fungsi register di sini jika perlu
// export const register = async (data: RegisterUserDto) => { ... }