import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api/client';
import { STORAGE_KEYS } from '@/lib/constants';
import { LoginDto, LoginResponse, User } from '@/types/api';

export enum UserRole {
  DOKTER = 'dokter',
  STAF = 'staf',
  KEPALA_KLINIK = 'kepala_klinik'
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  
  // Role helpers
  hasRole: (role: UserRole) => boolean;
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
      isLoading: false,
      
      login: async (credentials: LoginDto) => {
        try {
          set({ isLoading: true });
          
          const response = await apiClient.post<{ data: LoginResponse }>(
            '/auth/login',
            credentials
          );
          
          const { access_token, user } = response.data.data;
          
          // Store token
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          
          // Update state
          set({
            user: {
              ...user,
              roles: user.roles.map((role) => ({ id: 0, name: role as any })),
            } as User,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login gagal');
        }
      },
      
      logout: () => {
        // Clear storage
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        try {
          set({ isLoading: true });
          
          const response = await apiClient.get<{ data: User }>('/auth/profile');
          const user = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token invalid, clear auth
          get().logout();
          set({ isLoading: false });
        }
      },
      
      // Role helpers
      hasRole: (role: UserRole) => {
        const { user } = get();
        if (!user) return false;
        
        return user.roles.some((r) => r.name === role);
      },
      
      isKepalaKlinik: () => {
        return get().hasRole(UserRole.KEPALA_KLINIK);
      },
      
      isDokter: () => {
        return get().hasRole(UserRole.DOKTER);
      },
      
      isStaf: () => {
        return get().hasRole(UserRole.STAF);
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);