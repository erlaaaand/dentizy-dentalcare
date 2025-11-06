import axios from 'axios';
import { logout } from './authService';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            console.error('Unauthorized - Token expired or invalid');
            logout(); // Auto logout and redirect to login
        }

        // Handle 403 Forbidden - Insufficient permissions
        if (error.response?.status === 403) {
            console.error('Forbidden - Insufficient permissions');
            // You can show a toast notification here
        }

        // Handle 500 Server Error
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response.data);
            // You can show a toast notification here
        }

        return Promise.reject(error);
    }
);

export default api;