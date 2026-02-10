import type { User } from '../../../../types/users/user.types';

/**
 * Users Helper Functions
 * Utility functions for users
 */
export class UsersHelpers {
  /**
   * Format username for display
   */
  formatUsername(username: string): string {
    return username.toLowerCase().trim();
  }

  /**
   * Get role label
   */
  getRoleLabel(user: User): string {
    if (!user.roles || user.roles.length === 0) return 'No Role';
    return user.roles.map(role => role.name).join(', ');
  }

  /**
   * Get primary role
   */
  getPrimaryRole(user: User): string | null {
    if (!user.roles || user.roles.length === 0) return null;
    return user.roles[0].name;
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: User, roleName: string): boolean {
    if (!user.roles) return false;
    return user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  }

  /**
   * Check if user is active
   */
  isActive(user: User): boolean {
    return user.is_active === true;
  }

  /**
   * Check if user can be deleted
   */
  canDelete(user: User): boolean {
    return !user.deleted_at;
  }

  /**
   * Get user display name
   */
  getDisplayName(user: User): string {
    return user.nama_lengkap || user.username;
  }

  /**
   * Get user initials
   */
  getInitials(user: User): string {
    const name = user.nama_lengkap || user.username;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Get user status label
   */
  getStatusLabel(user: User): string {
    if (user.deleted_at) return 'Dihapus';
    if (!user.is_active) return 'Nonaktif';
    return 'Aktif';
  }

  /**
   * Get user status color
   */
  getStatusColor(user: User): string {
    if (user.deleted_at) return 'gray';
    if (!user.is_active) return 'red';
    return 'green';
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password harus mengandung angka');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      score += 0;
    } else {
      score += 1;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Generate random password
   */
  generateRandomPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Sort users by name
   */
  sortByName(users: User[], order: 'asc' | 'desc' = 'asc'): User[] {
    return [...users].sort((a, b) => {
      const nameA = this.getDisplayName(a);
      const nameB = this.getDisplayName(b);
      const comparison = nameA.localeCompare(nameB, 'id');
      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Filter active users
   */
  filterActive(users: User[]): User[] {
    return users.filter(user => this.isActive(user));
  }

  /**
   * Filter by role
   */
  filterByRole(users: User[], roleName: string): User[] {
    return users.filter(user => this.hasRole(user, roleName));
  }

  /**
   * Search users by name or username
   */
  search(users: User[], searchTerm: string): User[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return users;
    }
    
    return users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      (user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  }
}

export const usersHelpers = new UsersHelpers();