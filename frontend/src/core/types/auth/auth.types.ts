import type { 
  LoginDto, 
  UserResponseDto, 
  UpdateProfileDto,
  VerifyTokenDto
} from '../../api/model';

export type { 
  LoginDto, 
  UserResponseDto, 
  UpdateProfileDto, 
  VerifyTokenDto 
};

export interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
}