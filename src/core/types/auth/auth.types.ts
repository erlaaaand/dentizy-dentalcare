import type { 
  LoginDto,
  UpdateProfileDto,
  VerifyTokenDto,
  ForgotPasswordRequestDto,
  VerifyOTPDto,
  ResetPasswordWithTokenDto
} from '../../api/model';

// Re-export all DTOs
export type { 
  LoginDto,
  UpdateProfileDto,
  VerifyTokenDto,
  ForgotPasswordRequestDto,
  VerifyOTPDto,
  ResetPasswordWithTokenDto
};

// Response types based on the generated API
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  profile_photo?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto;
}

export interface VerifyOTPResponseDto {
  resetToken: string;
  message: string;
}

export interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}