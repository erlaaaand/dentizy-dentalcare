// frontend\src\app\(auth)\login\page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers';
import { AuthLayout } from '@/components/layout';
import { Input, PasswordInput } from '@/components/ui/forms';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/feedback';
import { MinimalFooter } from '@/components/ui/layout/footer';

export default function LoginPage() {
    const { login } = useAuth(); // Menggunakan logic login terpusat dari AuthProvider

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Hapus pesan error saat user mulai mengetik ulang
        if (error) setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validasi sederhana
        if (!formData.username.trim() || !formData.password.trim()) {
            setError('Username dan password harus diisi');
            setIsLoading(false);
            return;
        }

        try {
            await login({
                username: formData.username.trim(),
                password: formData.password.trim()
            });
            // Redirect ke dashboard ditangani otomatis oleh AuthProvider
        } catch (err: unknown) {
            let errorMessage = "Username atau password salah. Silakan coba lagi.";

            if (err instanceof Error) {
                // Standard JS Error
                errorMessage = err.message;
            } else if (
                typeof err === "object" &&
                err !== null &&
                "response" in err &&
                typeof (err).response === "object"
            ) {
                const response = (err as { response?: { data?: { message?: string } } }).response;
                errorMessage = response?.data?.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="space-y-6">
                {/* Header Konten Login */}
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Selamat Datang Kembali
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Masuk untuk mengakses dashboard klinik
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <AlertBanner
                        type="error"
                        message={error}
                        variant="inline"
                        size="sm"
                        dismissible
                        onClose={() => setError(null)}
                        className="animate-in fade-in slide-in-from-top-2"
                    />
                )}

                {/* Form Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        id="username"
                        label="Username"
                        placeholder="Masukkan username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        autoFocus
                        size="lg"
                        error={error ? " " : undefined} // Highlight border merah jika ada error umum
                    />

                    <PasswordInput
                        id="password"
                        label="Password"
                        placeholder="Masukkan password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                        size="lg"
                        error={error ? " " : undefined}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={isLoading}
                            shadow="md"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </div>
                </form>

                {/* Copyright Footer */}
                <div className="pt-2">
                    <MinimalFooter />
                </div>
            </div>
        </AuthLayout>
    );
}