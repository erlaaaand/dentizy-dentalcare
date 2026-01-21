import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useUsersControllerFindAll,
  useUsersControllerCreate,
  useUsersControllerUpdate,
  useUsersControllerRemove,
  useUsersControllerChangePassword,
  useUsersControllerResetPassword,
  useUsersControllerFindOne
} from '../../api/generated/users/users';
import { UserQueryParams } from '../../types/users/user.types';

export const useUsers = (params?: UserQueryParams) => {
  return useUsersControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

export const useUserDetail = (id: string) => {
  return useUsersControllerFindOne(id, {
    query: { enabled: !!id }
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['/users'] });

  const create = useUsersControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = useUsersControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = useUsersControllerRemove({ mutation: { onSuccess: invalidate } });
  
  // Fitur ubah password sendiri
  const changePassword = useUsersControllerChangePassword({});

  // Fitur admin reset password
  const resetPassword = useUsersControllerResetPassword({});

  return {
    createUser: create.mutate,
    updateUser: update.mutate,
    deleteUser: remove.mutate,
    changePassword: changePassword.mutate,
    resetPassword: resetPassword.mutate,
  };
};