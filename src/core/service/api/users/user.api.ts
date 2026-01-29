import {
  usersControllerFindAll,
  usersControllerCreate,
  usersControllerUpdate,
  usersControllerRemove,
  usersControllerFindOne,
  usersControllerChangePassword
} from '../../../api/generated/users/users';
import type { CreateUserDto, UpdateUserDto, ChangePasswordDto, UserQueryParams } from '../../../types/users/user.types';

export const UserApi = {
  findAll: async (params?: UserQueryParams) => await usersControllerFindAll(params),
  findOne: async (id: string) => await usersControllerFindOne(id),
  create: async (data: CreateUserDto) => await usersControllerCreate(data),
  update: async (id: string, data: UpdateUserDto) => await usersControllerUpdate(id, data),
  remove: async (id: string) => await usersControllerRemove(id),
  changePassword: async (data: ChangePasswordDto) => await usersControllerChangePassword(data)
};