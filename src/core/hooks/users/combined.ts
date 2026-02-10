import {
  useCreateUser,
  useUpdateUser,
  useRemoveUser,
  useChangePassword,
  useResetPassword,
  useGenerateTempPassword,
} from './mutations';

import {
  useCheckActivationStatus,
  useRequestActivation,
  useResendActivation,
  useVerifyActivationToken,
  useActivateAccount,
} from './activation-mutations';

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