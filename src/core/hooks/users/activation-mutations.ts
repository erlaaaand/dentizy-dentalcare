import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { usersService } from '../../service/api/users/users.api';
import type {
  CheckActivationStatusDto,
  RequestActivationDto,
  VerifyActivationTokenDto,
  ActivateAccountDto,
} from '../../types/users/user.types';
import { UsersCacheManager } from '../../service/api/users/cache/cache.manager';

const cacheManager = new UsersCacheManager();

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
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal mengaktifkan akun');
  }
});