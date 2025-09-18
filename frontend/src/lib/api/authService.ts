import api from './axiosInstance'; // Impor instance Axios kita
import Cookies from 'js-cookie'; // <-- Impor Cookies

// Tipe data untuk DTO bisa diimpor dari folder shared nanti
// Untuk sekarang, kita definisikan di sini
interface LoginDto {
    username: string;
    password: string;
}

// Fungsi untuk login
export const login = async (credentials: LoginDto) => {
    try {
        const response = await api.post('/auth/login', credentials);

        // Jika login berhasil dan ada access_token
        if (response.data.access_token) {
            const token = response.data.access_token;
            // Simpan token ke localStorage
            localStorage.setItem('access_token', response.data.access_token);
            Cookies.set('access_token', token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
        }

        return response.data;
    } catch (error) {
        // Tangani error, misalnya tampilkan pesan ke pengguna
        console.error('Login failed:', error);
        throw error;
    }
};

// Fungsi untuk logout
export const logout = () => {
  localStorage.removeItem('access_token');
  Cookies.remove('access_token'); // Hapus juga dari cookie
  // Arahkan ke halaman login
  window.location.href = '/login';
};

// Anda bisa tambahkan fungsi register di sini jika perlu
// export const register = async (data: RegisterUserDto) => { ... }