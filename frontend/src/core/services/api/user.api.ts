// frontend/src/core/services/api/user.api.ts
import {
  useUsersControllerCreate,
  useUsersControllerFindAll,
  useUsersControllerFindOne,
  useUsersControllerUpdate,
  useUsersControllerRemove,
  useUsersControllerChangePassword,
  useUsersControllerResetPassword,
  useUsersControllerGenerateTempPassword,
  useUsersControllerCheckUsername,
  useUsersControllerGetRecentUsers,
  useUsersControllerGetStatistics,
} from '@/core/api/generated/users/users';

export {
  useUsersControllerCreate as useCreateUser,
  useUsersControllerFindAll as useGetUsers,
  useUsersControllerFindOne as useGetUser,
  useUsersControllerUpdate as useUpdateUser,
  useUsersControllerRemove as useDeleteUser,
  useUsersControllerChangePassword as useChangePassword,
  useUsersControllerResetPassword as useResetPassword,
  useUsersControllerGenerateTempPassword as useGenerateTempPassword,
  useUsersControllerCheckUsername as useCheckUsername,
  useUsersControllerGetRecentUsers as useGetRecentUsers,
  useUsersControllerGetStatistics as useGetUserStatistics,
};

// Re-export types
export type {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  PasswordChangeResponseDto,
  UsersControllerFindAllParams,
  UsersControllerGetRecentUsersParams,
} from '@/core/api/model';