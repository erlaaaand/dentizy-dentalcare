import { BaseService } from "../../../base/base.service";
import type { QueryClient } from '@tanstack/react-query';
import {
  getRolesControllerFindAllQueryKey,
  getRolesControllerFindOneQueryKey
} from '../../../../api/generated/roles/roles';
import { rolesService } from "../roles.api";

export class RolesCacheManager extends BaseService {

  getListQueryKey() {
    return getRolesControllerFindAllQueryKey();
  }

  getDetailQueryKey(id: string) {
    return getRolesControllerFindOneQueryKey(id);
  }
  
  invalidateList(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getListQueryKey());
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/roles']);
  }

  async prefetchList(queryClient: QueryClient) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(),
      () => rolesService.findAll()
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => rolesService.findOne(id)
    );
  }
}

export const rolesCacheManager = new RolesCacheManager();