import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { usersService } from '../../service/api/users/user.api';
import type {
  UserQueryParams,
  RecentUsersParams,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  CheckActivationStatusDto,
  RequestActivationDto,
  VerifyActivationTokenDto,
  ActivateAccountDto,
} from '../../types/users/user.types';

// ==================== QUERY HOOKS ====================

export const useUsers = createQueryHook({
  queryKey: (params?: UserQueryParams) => 
    usersService.getListQueryKey(params),
  queryFn: (params) => usersService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useUser = createQueryHook({
  queryKey: (id?: string) => usersService.getDetailQueryKey(id!),
  queryFn: (id) => usersService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useUserStatistics = createQueryHook({
  queryKey: () => usersService.getStatisticsQueryKey(),
  queryFn: () => usersService.getStatistics(),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});

export const useRecentUsers = createQueryHook({
  queryKey: (params?: RecentUsersParams) => 
    usersService.getRecentUsersQueryKey(params),
  queryFn: (params) => usersService.getRecentUsers(params),
  options: {
    staleTime: 60 * 1000,
  },
});

export const useCheckUsername = createQueryHook({
  queryKey: (username?: string) => 
    usersService.getCheckUsernameQueryKey(username!),
  queryFn: (username) => usersService.checkUsername(username!),
  options: {
    enabled: false,
    staleTime: 1000, // Cache for 1 second to avoid too many requests
  },
});

// ==================== MUTATION HOOKS ====================

export const useCreateUser = createMutationHook({
  mutationFn: (data: CreateUserDto) => usersService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('User berhasil dibuat');
    usersService.invalidateAll(queryClient);
    usersService.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat user');
  }
});

export const useUpdateUser = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
    usersService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('User berhasil diperbarui');
    usersService.invalidateDetail(queryClient, id);
    usersService.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui user');
  }
});

export const useRemoveUser = createMutationHook({
  mutationFn: (id: string) => usersService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('User berhasil dihapus');
    usersService.invalidateAll(queryClient);
    usersService.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus user');
  }
});

export const useChangePassword = createMutationHook({
  mutationFn: (data: ChangePasswordDto) => usersService.changePassword(data),
  onSuccess: () => {
    toast.success('Password berhasil diubah');
  },
  onError: () => {
    toast.error('Gagal mengubah password');
  }
});

export const useResetPassword = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: ResetPasswordDto }) =>
    usersService.resetPassword(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Password berhasil direset');
    usersService.invalidateDetail(queryClient, id);
  },
  onError: () => {
    toast.error('Gagal mereset password');
  }
});

export const useGenerateTempPassword = createMutationHook({
  mutationFn: (id: string) => usersService.generateTempPassword(id),
  onSuccess: (data, id, queryClient) => {
    toast.success(`Password sementara: ${data.temporaryPassword}`);
    usersService.invalidateDetail(queryClient, id);
  },
  onError: () => {
    toast.error('Gagal generate password sementara');
  }
});

// ==================== ACTIVATION HOOKS ====================

export const useCheckActivationStatus = createMutationHook({
  mutationFn: (data: CheckActivationStatusDto) => 
    usersService.checkActivationStatus(data),
});

export const useRequestActivation = createMutationHook({
  mutationFn: (data: RequestActivationDto) => 
    usersService.requestActivation(data),
  onSuccess: () => {
    toast.success('Link aktivasi telah dikirim ke email Anda');
  },
  onError: () => {
    toast.error('Gagal mengirim link aktivasi');
  }
});

export const useResendActivation = createMutationHook({
  mutationFn: (data: RequestActivationDto) => 
    usersService.resendActivation(data),
  onSuccess: () => {
    toast.success('Link aktivasi telah dikirim ulang');
  },
  onError: () => {
    toast.error('Gagal mengirim ulang link aktivasi');
  }
});

export const useVerifyActivationToken = createMutationHook({
  mutationFn: (data: VerifyActivationTokenDto) => 
    usersService.verifyActivationToken(data),
});

export const useActivateAccount = createMutationHook({
  mutationFn: (data: ActivateAccountDto) => 
    usersService.activateAccount(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Akun berhasil diaktifkan');
    usersService.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal mengaktifkan akun');
  }
});

// ==================== COMBINED MUTATIONS HOOK ====================

export function useUserMutations() {
  const create = useCreateUser();
  const update = useUpdateUser();
  const remove = useRemoveUser();
  const changePassword = useChangePassword();
  const resetPassword = useResetPassword();
  const generateTempPassword = useGenerateTempPassword();

  return {
    createUser: create.mutate,
    createUserAsync: create.mutateAsync,
    updateUser: update.mutate,
    updateUserAsync: update.mutateAsync,
    deleteUser: remove.mutate,
    deleteUserAsync: remove.mutateAsync,
    changePassword: changePassword.mutate,
    changePasswordAsync: changePassword.mutateAsync,
    resetPassword: resetPassword.mutate,
    resetPasswordAsync: resetPassword.mutateAsync,
    generateTempPassword: generateTempPassword.mutate,
    generateTempPasswordAsync: generateTempPassword.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    isChangingPassword: changePassword.isPending,
    isResettingPassword: resetPassword.isPending,
    isGeneratingTempPassword: generateTempPassword.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      changePassword.isPending || 
      resetPassword.isPending || 
      generateTempPassword.isPending,

    createError: create.error,
    updateError: update.error,
    deleteError: remove.error,
    changePasswordError: changePassword.error,
    resetPasswordError: resetPassword.error,
    generateTempPasswordError: generateTempPassword.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetDelete: remove.reset,
    resetChangePassword: changePassword.reset,
    resetResetPassword: resetPassword.reset,
    resetGenerateTempPassword: generateTempPassword.reset,
  };
}

// ==================== ACTIVATION MUTATIONS HOOK ====================

export function useAccountActivation() {
  const checkStatus = useCheckActivationStatus();
  const requestActivation = useRequestActivation();
  const resendActivation = useResendActivation();
  const verifyToken = useVerifyActivationToken();
  const activateAccount = useActivateAccount();

  return {
    checkActivationStatus: checkStatus.mutate,
    checkActivationStatusAsync: checkStatus.mutateAsync,
    requestActivation: requestActivation.mutate,
    requestActivationAsync: requestActivation.mutateAsync,
    resendActivation: resendActivation.mutate,
    resendActivationAsync: resendActivation.mutateAsync,
    verifyActivationToken: verifyToken.mutate,
    verifyActivationTokenAsync: verifyToken.mutateAsync,
    activateAccount: activateAccount.mutate,
    activateAccountAsync: activateAccount.mutateAsync,

    isCheckingStatus: checkStatus.isPending,
    isRequestingActivation: requestActivation.isPending,
    isResendingActivation: resendActivation.isPending,
    isVerifyingToken: verifyToken.isPending,
    isActivating: activateAccount.isPending,
    
    checkStatusError: checkStatus.error,
    requestActivationError: requestActivation.error,
    resendActivationError: resendActivation.error,
    verifyTokenError: verifyToken.error,
    activateAccountError: activateAccount.error,
  };
}

// ==================== UTILITY HOOKS ====================

export function usePrefetchUser() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: UserQueryParams) =>
      usersService.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      usersService.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateUsers() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => usersService.invalidateAll(queryClient),
    invalidateList: (params?: UserQueryParams) => 
      usersService.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      usersService.invalidateDetail(queryClient, id),
    invalidateStatistics: () =>
      usersService.invalidateStatistics(queryClient),
    invalidateRecentUsers: (params?: RecentUsersParams) =>
      usersService.invalidateRecentUsers(queryClient, params),
  };
}