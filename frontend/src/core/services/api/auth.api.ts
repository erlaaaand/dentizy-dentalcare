// frontend/src/core/services/api/auth.api.ts
import {
  useAuthControllerLogin,
  useAuthControllerLogout,
  useAuthControllerRefresh,
  useAuthControllerVerify,
  useAuthControllerGetProfile,
  useAuthControllerUpdateMyProfile,
} from '@/core/api/generated/auth/auth';

export {
  useAuthControllerLogin as useLogin,
  useAuthControllerLogout as useLogout,
  useAuthControllerRefresh as useRefreshToken,
  useAuthControllerVerify as useVerifyToken,
  useAuthControllerGetProfile as useGetProfile,
  useAuthControllerUpdateMyProfile as useUpdateProfile,
};

// Re-export types
export type {
  LoginDto,
  User,
  UpdateProfileDto,
  VerifyTokenDto,
} from '@/core/api/model';