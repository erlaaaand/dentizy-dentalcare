import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useUsersControllerFindAll,
  useUsersControllerCreate,
  useUsersControllerUpdate,
  useUsersControllerRemove,
  useUsersControllerChangePassword,
  useUsersControllerResetPassword,
  useUsersControllerFindOne,
  useUsersControllerGenerateTempPassword,
  useUsersControllerGetStatistics,
  useUsersControllerGetRecentUsers,
  useUsersControllerCheckUsername,
  useUsersControllerCheckActivationStatus,
  useUsersControllerRequestActivation,
  useUsersControllerResendActivation,
  useUsersControllerVerifyActivationToken,
  useUsersControllerActivateAccount
} from '../../api/generated/users/users';
import type { UserQueryParams, RecentUsersParams } from '../../types/users/user.types';

/**
 * Hook untuk mendapatkan daftar user dengan pagination dan filter
 */
export const useUsers = (params?: UserQueryParams) => {
  return useUsersControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

/**
 * Hook untuk mendapatkan detail user berdasarkan ID
 */
export const useUserDetail = (id: string) => {
  return useUsersControllerFindOne(id, {
    query: { enabled: !!id }
  });
};

/**
 * Hook untuk mendapatkan statistik user
 */
export const useUserStatistics = () => {
  return useUsersControllerGetStatistics();
};

/**
 * Hook untuk mendapatkan user yang baru dibuat
 */
export const useRecentUsers = (params?: RecentUsersParams) => {
  return useUsersControllerGetRecentUsers(params);
};

/**
 * Hook untuk cek ketersediaan username
 */
export const useCheckUsername = (username: string) => {
  return useUsersControllerCheckUsername(username, {
    query: { 
      enabled: !!username && username.length > 0,
      staleTime: 1000 // Cache for 1 second to avoid too many requests
    }
  });
};

/**
 * Hook untuk semua operasi mutasi user
 */
export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/users'] });

  const create = useUsersControllerCreate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const update = useUsersControllerUpdate({ 
    mutation: { onSuccess: invalidate } 
  });
  
  const remove = useUsersControllerRemove({ 
    mutation: { onSuccess: invalidate } 
  });
  
  // Password management
  const changePassword = useUsersControllerChangePassword({
    mutation: {
      onSuccess: () => {
        // Optionally show success message or redirect
      }
    }
  });

  const resetPassword = useUsersControllerResetPassword({
    mutation: { onSuccess: invalidate }
  });

  const generateTempPassword = useUsersControllerGenerateTempPassword({
    mutation: { onSuccess: invalidate }
  });

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
  };
};

/**
 * Hook untuk operasi aktivasi akun
 */
export const useAccountActivation = () => {
  const queryClient = useQueryClient();

  const checkStatus = useUsersControllerCheckActivationStatus();
  const requestActivation = useUsersControllerRequestActivation();
  const resendActivation = useUsersControllerResendActivation();
  const verifyToken = useUsersControllerVerifyActivationToken();
  const activateAccount = useUsersControllerActivateAccount({
    mutation: {
      onSuccess: () => {
        // Invalidate user queries after successful activation
        queryClient.invalidateQueries({ queryKey: ['/users'] });
      }
    }
  });

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
  };
};