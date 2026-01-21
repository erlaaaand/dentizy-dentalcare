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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const targetUrl = redirectUrl || ROUTES.DASHBOARD;
      router.replace(targetUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username || !formData.password) {
      return;
    }
    
    // Call login function
    login(formData);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
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
              placeholder="user_name"
              required
              disabled={isLoginPending}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              autoComplete="username"
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                Lupa password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              disabled={isLoginPending}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoginPending}>
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
      </div>
    </div>
  );
}