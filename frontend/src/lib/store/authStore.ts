import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum UserRole {
  DOKTER = 'dokter',
  STAF = 'staf',
  KEPALA_KLINIK = 'kepala_klinik'
}

interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  roles: UserRole[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  
  // Helper methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isKepalaKlinik: () => boolean;
  isDokter: () => boolean;
  isStaf: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.roles.includes(role) ?? false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some(role => user?.roles.includes(role)) ?? false;
      },

      hasAllRoles: (roles) => {
        const { user } = get();
        return roles.every(role => user?.roles.includes(role)) ?? false;
      },

      isKepalaKlinik: () => get().hasRole(UserRole.KEPALA_KLINIK),
      isDokter: () => get().hasRole(UserRole.DOKTER),
      isStaf: () => get().hasRole(UserRole.STAF),
    }),
    {
      name: 'auth-storage',
    }
  )
);