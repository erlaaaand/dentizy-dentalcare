import axios from 'axios';

// Buat instance Axios dengan konfigurasi dasar
const api = axios.create({
    baseURL: 'http://localhost:3000', // URL base dari backend NestJS Anda
});

// Tambahkan "interceptor" untuk request
// Ini adalah fungsi yang akan berjalan SEBELUM setiap request dikirim
api.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage
        const token = localStorage.getItem('access_token');

        // Jika token ada, tambahkan ke header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Lakukan sesuatu jika ada error pada konfigurasi request
        return Promise.reject(error);
    }
);

export default api;