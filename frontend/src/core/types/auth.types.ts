import { LoginDto, UserResponseDto } from '../api/model';

export interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials extends LoginDto {}

export interface AuthActions {
  login: (credentials: LoginCredentials) => void;
  logout: () => void;
}