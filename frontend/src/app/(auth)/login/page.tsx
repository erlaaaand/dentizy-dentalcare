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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const targetUrl = redirectUrl || ROUTES.DASHBOARD;
      router.replace(targetUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const validateForm = (): boolean => {
    const newErrors = {
      username: "",
      password: ""
    };
    
    let isValid = true;

    if (!formData.username || formData.username.trim() === "") {
      newErrors.username = "Username harus diisi";
      isValid = false;
    }

    if (!formData.password || formData.password.trim() === "") {
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
    
    // Reset errors
    setErrors({ username: "", password: "" });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Prevent double submission
    if (isLoginPending) {
      return;
    }
    
    // Trim whitespace
    const loginData: LoginDto = {
      username: formData.username.trim(),
      password: formData.password
    };
    
    // Execute login
    login(loginData);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, username: value }));
    
    // Clear error when user types
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    
    // Clear error when user types
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoginPending) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo/Brand */}
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
        
        {/* Header */}
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
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Username Field */}
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="masukkan username"
              required
              disabled={isLoginPending}
              value={formData.username}
              onChange={handleUsernameChange}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a 
                href="#" 
                className="ml-auto text-sm underline-offset-4 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement forgot password
                }}
              >
                Lupa password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="masukkan password"
              required
              disabled={isLoginPending}
              value={formData.password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          
          {/* Submit Button */}
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

        {/* Footer/Help Text */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Hubungi administrator jika mengalami kesulitan login</p>
        </div>
      </div>
    </div>
  );
}