'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/authService';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validation
        if (!username.trim() || !password.trim()) {
            setError('Username dan password harus diisi');
            setIsLoading(false);
            return;
        }

        try {
            await login({ username: username.trim(), password: password.trim() });
            router.push('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 
                               err.message || 
                               'Username atau password salah. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="p-8 space-y-6 bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
                    <p className="text-gray-600">Masuk ke akun Dentizy Anda</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label 
                            htmlFor="username" 
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     transition-all duration-200"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label 
                            htmlFor="password" 
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     transition-all duration-200"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl animate-pulse">
                            <div className="flex items-start space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl 
                                 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold
                                 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <span>Masuk</span>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <p>&copy; 2025 Dentizy Dentalcare. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}