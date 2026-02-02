import {
  usersControllerFindAll,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerRemove,
  usersControllerFindOne,
  usersControllerChangePassword,
  usersControllerResetPassword,
  usersControllerGenerateTempPassword,
  usersControllerGetStatistics,
  usersControllerGetRecentUsers,
  usersControllerCheckUsername,
  usersControllerCheckActivationStatus,
  usersControllerRequestActivation,
  usersControllerResendActivation,
  usersControllerVerifyActivationToken,
  usersControllerActivateAccount
} from '../../../api/generated/users/users';
import type { 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto,
  ResetPasswordDto,
  UserQueryParams,
  RecentUsersParams,
  CheckActivationStatusDto,
  RequestActivationDto,
  VerifyActivationTokenDto,
  ActivateAccountDto
} from '../../../types/users/user.types';

export const UserApi = {
  // User CRUD operations
  findAll: async (params?: UserQueryParams) => await usersControllerFindAll(params),
  findOne: async (id: string) => await usersControllerFindOne(id),
  create: async (data: CreateUserDto) => await usersControllerCreate(data),
  update: async (id: string, data: UpdateUserDto) => await usersControllerUpdate(id, data),
  remove: async (id: string) => await usersControllerRemove(id),
  
  // Password management
  changePassword: async (data: ChangePasswordDto) => await usersControllerChangePassword(data),
  resetPassword: async (id: string, data: ResetPasswordDto) => await usersControllerResetPassword(id, data),
  generateTempPassword: async (id: string) => await usersControllerGenerateTempPassword(id),
  
  // Statistics and recent users
  getStatistics: async () => await usersControllerGetStatistics(),
  getRecentUsers: async (params?: RecentUsersParams) => await usersControllerGetRecentUsers(params),
  
  // Username validation
  checkUsername: async (username: string) => await usersControllerCheckUsername(username),
  
  // Account activation
  checkActivationStatus: async (data: CheckActivationStatusDto) => await usersControllerCheckActivationStatus(data),
  requestActivation: async (data: RequestActivationDto) => await usersControllerRequestActivation(data),
  resendActivation: async (data: RequestActivationDto) => await usersControllerResendActivation(data),
  verifyActivationToken: async (data: VerifyActivationTokenDto) => await usersControllerVerifyActivationToken(data),
  activateAccount: async (data: ActivateAccountDto) => await usersControllerActivateAccount(data)
};