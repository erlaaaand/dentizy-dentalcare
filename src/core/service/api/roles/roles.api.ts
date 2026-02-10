import { BaseService } from '../../base/base.service';
import {
  rolesControllerFindAll,
  rolesControllerFindOne,
} from '../../../api/generated/roles/roles';
import type { UserRoleDto } from '../../../types/roles/roles.types';

export class RolesService extends BaseService {
  
  async findAll(): Promise<UserRoleDto[]> {
    const response = await rolesControllerFindAll();
    
    if ((response.status as number) === 200) {
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as UserRoleDto[]) : [];
    }
    
    return [];
  }

  async findOne(id: string): Promise<UserRoleDto | null> {
    if (!id) return null;

    const response = await rolesControllerFindOne(id);
    
    if ((response.status as number) === 200) {
      return (response.data as unknown) as UserRoleDto;
    }

    return null;
  }
}

export const rolesService = new RolesService();