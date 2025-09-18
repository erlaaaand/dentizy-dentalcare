'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/authService';

export default function LoginPage() {
    // State untuk menyimpan input pengguna
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // State untuk menampilkan pesan error jika login gagal
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Hook untuk mengarahkan pengguna ke halaman lain
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah form me-refresh halaman
        setError(null);
        setIsLoading(true);

        try {
            // Panggil fungsi login dari service API kita
            await login({ username, password });
            
            // Jika tidak ada error, berarti login berhasil.
            // Arahkan pengguna ke halaman dasbor.
            router.push('/dashboard');

        } catch (err) {
            // Jika terjadi error (misalnya 401 Unauthorized dari backend)
            setError('Username atau password salah. Silakan coba lagi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 space-y-6 bg-white rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Selamat Datang</h1>
                    <p className="text-gray-500">Masuk ke akun Dentizy Anda</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label 
                            htmlFor="username" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="password" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}
