import type { 
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  ActivateAccountDto,
  ActivateAccountResponseDto,
  RequestActivationDto,
  RequestActivationResponseDto,
  CheckActivationStatusDto,
  CheckActivationStatusResponseDto,
  VerifyActivationTokenDto,
  VerifyActivationTokenResponseDto,
  PasswordChangeResponseDto,
  UsersControllerFindAllParams,
  UsersControllerGetRecentUsersParams
} from '../../api/model';

// Re-export all DTOs
export type { 
  UserResponseDto, 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto,
  ResetPasswordDto,
  ActivateAccountDto,
  ActivateAccountResponseDto,
  RequestActivationDto,
  RequestActivationResponseDto,
  CheckActivationStatusDto,
  CheckActivationStatusResponseDto,
  VerifyActivationTokenDto,
  VerifyActivationTokenResponseDto,
  PasswordChangeResponseDto
};

// Alias types
export type User = UserResponseDto;
export type UserQueryParams = UsersControllerFindAllParams;
export type RecentUsersParams = UsersControllerGetRecentUsersParams;