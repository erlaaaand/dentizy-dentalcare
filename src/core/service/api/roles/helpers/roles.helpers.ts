import type { UserRoleDto } from '../../../../types/roles/roles.types';

/**
 * Roles Helper Functions
 */
export class RolesHelper {
  /**
   * Mendapatkan label peran dalam Bahasa Indonesia
   */
  getRoleLabel(role: UserRoleDto): string {
    const labels: Record<string, string> = {
      'kepala_klinik': 'Kepala Klinik',
      'dokter': 'Dokter',
      'staf': 'Staf'
    };
    return labels[role.name] || role.name;
  }

  /**
   * Mendapatkan deskripsi akses peran
   */
  getRoleDescription(role: UserRoleDto): string {
    const descriptions: Record<string, string> = {
      'kepala_klinik': 'Akses penuh ke seluruh sistem',
      'dokter': 'Mengelola pasien dan rekam medis',
      'staf': 'Mengelola jadwal dan data pasien'
    };
    return descriptions[role.name] || 'Peran pengguna';
  }

  /**
   * Mendapatkan warna status peran untuk UI
   */
  getRoleColor(role: UserRoleDto): string {
    const colors: Record<string, string> = {
      'kepala_klinik': 'purple',
      'dokter': 'blue',
      'staf': 'green'
    };
    return colors[role.name] || 'gray';
  }

  /**
   * Mengurutkan peran berdasarkan hierarki jabatan
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
  }

  isAdmin(role: UserRoleDto): boolean {
    return role.name === 'kepala_klinik';
  }

  isDoctor(role: UserRoleDto): boolean {
    return role.name === 'dokter';
  }

  isStaff(role: UserRoleDto): boolean {
    return role.name === 'staf';
  }

  /**
   * Format daftar peran menjadi string untuk tampilan
   */
  formatRolesForDisplay(roles: UserRoleDto[]): string {
    if (!roles || roles.length === 0) return 'No Role';
    return roles.map(role => this.getRoleLabel(role)).join(', ');
  }
}

export const rolesHelper = new RolesHelper();