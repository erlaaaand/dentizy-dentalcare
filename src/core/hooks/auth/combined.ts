import {
  useAuthLogin,
  useAuthLogout,
  useAuthRefresh,
  useAuthVerify,
  useUpdateProfile,
  useForgotPassword,
  useVerifyOTP,
  useResetPassword,
} from './mutations';

export function useAuthMutations() {
  const login = useAuthLogin();
  const logout = useAuthLogout();
  const refresh = useAuthRefresh();
  const verify = useAuthVerify();
  const updateProfile = useUpdateProfile();
  const forgotPassword = useForgotPassword();
  const verifyOTP = useVerifyOTP();
  const resetPassword = useResetPassword();

  return {
    login: login.mutate,
    loginAsync: login.mutateAsync,
    logout: logout.mutate,
    logoutAsync: logout.mutateAsync,
    refresh: refresh.mutate,
    refreshAsync: refresh.mutateAsync,
    verify: verify.mutate,
    verifyAsync: verify.mutateAsync,
    updateProfile: updateProfile.mutate,
    updateProfileAsync: updateProfile.mutateAsync,
    forgotPassword: forgotPassword.mutate,
    forgotPasswordAsync: forgotPassword.mutateAsync,
    verifyOTP: verifyOTP.mutate,
    verifyOTPAsync: verifyOTP.mutateAsync,
    resetPassword: resetPassword.mutate,
    resetPasswordAsync: resetPassword.mutateAsync,

    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
    isRefreshing: refresh.isPending,
    isVerifying: verify.isPending,
    isUpdatingProfile: updateProfile.isPending,
    isSendingOTP: forgotPassword.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    isResettingPassword: resetPassword.isPending,

    loginError: login.error,
    logoutError: logout.error,
    refreshError: refresh.error,
    verifyError: verify.error,
    updateProfileError: updateProfile.error,
    forgotPasswordError: forgotPassword.error,
    verifyOTPError: verifyOTP.error,
    resetPasswordError: resetPassword.error,
  };
}