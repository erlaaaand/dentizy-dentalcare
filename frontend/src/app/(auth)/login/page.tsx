"use client";

import { useState } from "react";
import { useAuth } from "@/src/core/providers/auth-provider"; // Gunakan hook baru
import { LoginDto } from "@/src/core/api/model";
import { Button } from "@/src/components/dashboard-ui/components/button";
import { Input } from "@/src/components/dashboard-ui/components/input";
import { Label } from "@/src/components/dashboard-ui/components/label";
import { IconInnerShadowTop } from "@tabler/icons-react"; // Opsional: Logo

export default function LoginPage() {
  // Ambil fungsi login dan state loading dari Provider
  const { login, isLoginPending } = useAuth();
  
  const [formData, setFormData] = useState<LoginDto>({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Panggil fungsi login dari provider
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
        </div>
        
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="username"
              placeholder="user_name"
              required
              disabled={isLoginPending}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoginPending}>
            {isLoginPending ? "Sedang Memproses..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}