'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from '@/src/core/providers/AuthProvider';
import { rolesHelper } from '@/src/core/service/api/roles/helpers/roles.helpers';
import type { UserRoleDto } from '@/src/core/types/roles/roles.types';

// ==================== PERMISSION TYPES ====================

/**
 * Kumpulan permission yang dihitung satu kali dari role user
 * dan tersedia secara global tanpa perlu re-kalkulasi di setiap komponen.
 */
export interface AppPermissions {
  // --- Role flags ---
  isKepalaKlinik: boolean;
  isDokter: boolean;
  isStaf: boolean;

  // --- Feature access ---
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAllMedicalRecords: boolean;
  canViewOwnMedicalRecordsOnly: boolean;
  canManageTreatments: boolean;
  canManageTreatmentCategories: boolean;
  canProcessPayments: boolean;
  canViewPaymentReports: boolean;
  canManageAppointments: boolean;
  canViewDashboardStats: boolean;
}

// ==================== UI PREFERENCE TYPES ====================

export interface UIPreferences {
  /** Label peran dalam Bahasa Indonesia untuk tampilan */
  roleLabel: string;
  /** Warna badge peran */
  roleColor: string;
  /** Deskripsi akses peran */
  roleDescription: string;
  /** Inisial nama user untuk avatar */
  userInitials: string;
}

// ==================== CONTEXT TYPE ====================

interface SettingsContextType {
  permissions: AppPermissions;
  uiPreferences: UIPreferences;
  /** Primary role object (bisa null jika belum login) */
  primaryRole: UserRoleDto | null;
  /** Semua role yang dimiliki user */
  allRoles: UserRoleDto[];
}

// ==================== DEFAULTS ====================

const DEFAULT_PERMISSIONS: AppPermissions = {
  isKepalaKlinik: false,
  isDokter: false,
  isStaf: false,
  canManageUsers: false,
  canManageRoles: false,
  canViewAllMedicalRecords: false,
  canViewOwnMedicalRecordsOnly: false,
  canManageTreatments: false,
  canManageTreatmentCategories: false,
  canProcessPayments: false,
  canViewPaymentReports: false,
  canManageAppointments: false,
  canViewDashboardStats: false,
};

const DEFAULT_UI_PREFERENCES: UIPreferences = {
  roleLabel: '',
  roleColor: 'gray',
  roleDescription: '',
  userInitials: '?',
};

// ==================== PERMISSION CALCULATOR ====================

function buildPermissions(roles: UserRoleDto[]): AppPermissions {
  if (!roles || roles.length === 0) return DEFAULT_PERMISSIONS;

  const primaryRole = roles[0];
  const isKepalaKlinik = rolesHelper.isAdmin(primaryRole);
  const isDokter = rolesHelper.isDoctor(primaryRole);
  const isStaf = rolesHelper.isStaff(primaryRole);

  return {
    isKepalaKlinik,
    isDokter,
    isStaf,

    // User management: hanya kepala klinik
    canManageUsers: isKepalaKlinik,
    canManageRoles: isKepalaKlinik,

    // Medical records: dokter hanya lihat miliknya sendiri
    canViewAllMedicalRecords: isKepalaKlinik || isStaf,
    canViewOwnMedicalRecordsOnly: isDokter,

    // Treatment catalog: kepala klinik & staf bisa manage
    canManageTreatments: isKepalaKlinik || isStaf,
    canManageTreatmentCategories: isKepalaKlinik || isStaf,

    // Payments: staf yang proses, kepala klinik lihat semua
    canProcessPayments: isKepalaKlinik || isStaf,
    canViewPaymentReports: isKepalaKlinik,

    // Appointments: semua role bisa manage sesuai konteks
    canManageAppointments: isKepalaKlinik || isStaf || isDokter,

    // Dashboard stats: kepala klinik penuh, lainnya terbatas
    canViewDashboardStats: isKepalaKlinik || isStaf,
  };
}

function buildUIPreferences(
  roles: UserRoleDto[],
  namaLengkap: string,
  username: string
): UIPreferences {
  if (!roles || roles.length === 0) {
    return { ...DEFAULT_UI_PREFERENCES };
  }

  const primaryRole = roles[0];
  const sortedRoles = rolesHelper.sortByHierarchy(roles);

  // Inisial dari nama lengkap
  const name = namaLengkap || username;
  const parts = name.split(' ').filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

  return {
    roleLabel: rolesHelper.formatRolesForDisplay(sortedRoles),
    roleColor: rolesHelper.getRoleColor(primaryRole),
    roleDescription: rolesHelper.getRoleDescription(primaryRole),
    userInitials: initials,
  };
}

// ==================== CONTEXT ====================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const roles: UserRoleDto[] = useMemo(
    () => (user?.roles as UserRoleDto[] | undefined) ?? [],
    [user?.roles]
  );

  const permissions = useMemo(() => buildPermissions(roles), [roles]);

  const uiPreferences = useMemo(
    () =>
      buildUIPreferences(
        roles,
        user?.nama_lengkap ?? '',
        user?.username ?? ''
      ),
    [roles, user?.nama_lengkap, user?.username]
  );

  const primaryRole = useMemo(
    () => (roles.length > 0 ? rolesHelper.sortByHierarchy(roles)[0] : null),
    [roles]
  );

  const value = useMemo<SettingsContextType>(
    () => ({
      permissions,
      uiPreferences,
      primaryRole,
      allRoles: roles,
    }),
    [permissions, uiPreferences, primaryRole, roles]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ==================== HOOKS ====================

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings harus digunakan di dalam SettingsProvider');
  }
  return ctx;
}

/** Shortcut untuk mengakses permissions saja */
export function usePermissions(): AppPermissions {
  return useSettings().permissions;
}

/** Shortcut untuk mengakses UI preferences saja */
export function useUIPreferences(): UIPreferences {
  return useSettings().uiPreferences;
}