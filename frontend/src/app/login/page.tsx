"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/core/providers/auth-provider";
import { LoginDto } from "@/src/core/api/model";
import { Button } from "@/src/components/dashboard-ui/components/button";
import { Input } from "@/src/components/dashboard-ui/components/input";
import { Label } from "@/src/components/dashboard-ui/components/label";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { ROUTES } from "@/src/core/constants/routes.constants";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoginPending, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  
  const [formData, setFormData] = useState<LoginDto>({
    username: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({
    username: "",
    password: ""
  });

  useEffect(() => {
    if (isAuthenticated) {
      const targetUrl = redirectUrl || ROUTES.DASHBOARD;
      router.replace(targetUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const validateForm = (): boolean => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Username harus diisi";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({ username: "", password: "" });
    
    if (!validateForm()) return;
    if (isLoginPending) return;
    
    login({
      username: formData.username.trim(),
      password: formData.password
    });
  };

  const handleChange = (field: keyof LoginDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
            <Input
              id="password"
              type="password"
              placeholder="masukkan password"
              disabled={isLoginPending}
              value={formData.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
              className={errors.password ? "border-red-500" : ""}
            />
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