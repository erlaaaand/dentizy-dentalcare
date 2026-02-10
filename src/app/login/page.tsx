'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthLogin } from '@/src/core/hooks/auth/mutations';
import { toast } from 'sonner';
import { Button } from '@/src/components/login-ui/button';
import { Input } from '@/src/components/login-ui/input';
import { Label } from '@/src/components/login-ui/label';
import { IconInnerShadowTop, IconEye, IconEyeOff } from '@tabler/icons-react'; // Tambahkan IconEye & IconEyeOff
import type { LoginDto } from '@/src/core/types/auth/auth.types';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { mutateAsync: loginAsync, isPending: isLoginPending } = useAuthLogin();

  const [formData, setFormData] = useState<LoginDto>({
    username: '',
    password: '',
  });

  // State untuk kontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const redirectUrl = searchParams.get('callbackUrl');
  const callbackUrl = redirectUrl || '/dashboard';

  const handleChange = (field: keyof LoginDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!formData.username) newErrors.username = 'Username wajib diisi';
    if (!formData.password) newErrors.password = 'Password wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await loginAsync(formData);
      router.push(callbackUrl);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Kredensial yang Anda masukkan salah.';

      toast.error('Login Gagal', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        
        <a 
          href="#" 
          className="flex items-center gap-2 self-center font-medium"
          onClick={(e) => e.preventDefault()}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <IconInnerShadowTop className="size-4" />
          </div>
          Dentizy Dentalcare
        </a>
        
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold">Login ke Sistem</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Masukkan username dan password untuk melanjutkan
          </p>
          {redirectUrl && (
            <p className="text-xs text-muted-foreground">
              Anda akan diarahkan ke halaman sebelumnya setelah login
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid gap-6">
          
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="masukkan username"
              disabled={isLoginPending}
              value={formData.username}
              onChange={handleChange('username')}
              autoComplete="username"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a 
                href="#" 
                className="ml-auto text-sm underline-offset-4 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Lupa password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Dinamis berdasarkan state
                placeholder="masukkan password"
                disabled={isLoginPending}
                value={formData.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
                className={`pr-10 ${errors.password ? "border-red-500" : ""}`} // Beri padding kanan untuk icon
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoginPending}
              >
                {showPassword ? (
                  <IconEyeOff className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoginPending}
          >
            {isLoginPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sedang Memproses...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Hubungi administrator jika mengalami kesulitan login</p>
        </div>
      </div>
    </div>
  );
}