import { BaseService } from '../../base/base.service';
import {
  rolesControllerFindAll,
  rolesControllerFindOne,
  getRolesControllerFindAllQueryKey,
  getRolesControllerFindOneQueryKey
} from '../../../api/generated/roles/roles';

import type { QueryClient } from '@tanstack/react-query';
import type { UserRoleDto } from '../../../types/roles/roles.types';

// Re-export hooks
export {
  useRolesControllerFindAll,
  useRolesControllerFindOne
} from '../../../api/generated/roles/roles';

// Re-export query keys
export {
  getRolesControllerFindAllQueryKey,
  getRolesControllerFindOneQueryKey
};

class RolesService extends BaseService {
  // ==================== QUERIES ====================
  
  async findAll(): Promise<UserRoleDto[]> {
    const response = await rolesControllerFindAll();
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response as UserRoleDto[];
    }
    
    const typedResponse = response as unknown as { data: UserRoleDto[] } | UserRoleDto[];
    
    if ('data' in typedResponse) {
      return typedResponse.data || [];
    }
    
    return typedResponse || [];
  }

  async findOne(id: string): Promise<UserRoleDto | null> {
    if (!id) return null;

    const response = await rolesControllerFindOne(id);
    
    const typedResponse = response as unknown as { data: UserRoleDto } | UserRoleDto;

    if ('data' in typedResponse) {
      return typedResponse.data;
    }

    return typedResponse || null;
  }

  // ==================== QUERY KEYS ====================
  
  getListQueryKey() {
    return getRolesControllerFindAllQueryKey();
  }

  getDetailQueryKey(id: string) {
    return getRolesControllerFindOneQueryKey(id);
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateList(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getListQueryKey());
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/roles'] as const);
  }

  async prefetchList(queryClient: QueryClient) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(),
      () => this.findAll()
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => this.findOne(id)
    );
  }
}

export const rolesService = new RolesService();

// Helper functions
export const rolesHelpers = {
  /**
   * Get role label
   */
  getRoleLabel(role: UserRoleDto): string {
    const labels: Record<string, string> = {
      'kepala_klinik': 'Kepala Klinik',
      'dokter': 'Dokter',
      'staf': 'Staf'
    };
    return labels[role.name] || role.name;
  },

  /**
   * Get role description
   */
  getRoleDescription(role: UserRoleDto): string {
    const descriptions: Record<string, string> = {
      'kepala_klinik': 'Akses penuh ke seluruh sistem',
      'dokter': 'Mengelola pasien dan rekam medis',
      'staf': 'Mengelola jadwal dan data pasien'
    };
    return descriptions[role.name] || 'Peran pengguna';
  },

  /**
   * Get role color for UI
   */
  getRoleColor(role: UserRoleDto): string {
    const colors: Record<string, string> = {
      'kepala_klinik': 'purple',
      'dokter': 'blue',
      'staf': 'green'
    };
    return colors[role.name] || 'gray';
  },

  /**
   * Sort roles by hierarchy
   */
  sortByHierarchy(roles: UserRoleDto[]): UserRoleDto[] {
    const hierarchy: Record<string, number> = {
      'kepala_klinik': 1,
      'dokter': 2,
      'staf': 3
    };

    return [...roles].sort((a, b) => {
      const orderA = hierarchy[a.name] || 999;
      const orderB = hierarchy[b.name] || 999;
      return orderA - orderB;
    });
  },

  /**
   * Check if role is admin
   */
  isAdmin(role: UserRoleDto): boolean {
    return role.name === 'kepala_klinik';
  },

  /**
   * Check if role is doctor
   */
  isDoctor(role: UserRoleDto): boolean {
    return role.name === 'dokter';
  },

  /**
   * Check if role is staff
   */
  isStaff(role: UserRoleDto): boolean {
    return role.name === 'staf';
  },

  /**
   * Format roles for display
   */
  formatRolesForDisplay(roles: UserRoleDto[]): string {
    if (!roles || roles.length === 0) return 'No Role';
    return roles.map(role => this.getRoleLabel(role)).join(', ');
  }
};