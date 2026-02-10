import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { usersService } from '../../service/api/users/users.api';
import type {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from '../../types/users/user.types';
import { UsersCacheManager } from '../../service/api/users/cache/cache.manager';

const cacheManager = new UsersCacheManager();

export const useCreateUser = createMutationHook({
  mutationFn: (data: CreateUserDto) => usersService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('User berhasil dibuat');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
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
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui user');
  }
});

export const useRemoveUser = createMutationHook({
  mutationFn: (id: string) => usersService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('User berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
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
    cacheManager.invalidateDetail(queryClient, id);
  },
  onError: () => {
    toast.error('Gagal mereset password');
  }
});

export const useGenerateTempPassword = createMutationHook({
  mutationFn: (id: string) => usersService.generateTempPassword(id),
  onSuccess: (data, id, queryClient) => {
    toast.success(`Password sementara: ${data.temporaryPassword}`);
    cacheManager.invalidateDetail(queryClient, id);
  },
  onError: () => {
    toast.error('Gagal generate password sementara');
  }
});