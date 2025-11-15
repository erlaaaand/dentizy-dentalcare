import { UserRole } from '@/core/types/api';

/**
 * Normalizes role string to match UserRole enum values
 */
function normalizeRole(role: string): UserRole | undefined {
  if (!role) return undefined;
  const formatted = role.toLowerCase().trim();

  console.log('🔍 normalizeRole:', {
    input: role,
    formatted,
    UserRole_KEPALA_KLINIK: UserRole.KEPALA_KLINIK
  });

  switch (formatted) {
    case 'kepala_klinik':
    case 'kepala klinik':
      return UserRole.KEPALA_KLINIK;
    case 'dokter':
      return UserRole.DOKTER;
    case 'staf':
    case 'staff':
      return UserRole.STAF;
    default:
      console.warn(`⚠️ Role tidak dikenali: ${role}`);
      return undefined;
  }
}

// Permission definitions
export enum Permission {
  // Appointment permissions
  VIEW_APPOINTMENTS = 'view_appointments',
  CREATE_APPOINTMENT = 'create_appointment',
  UPDATE_APPOINTMENT = 'update_appointment',
  DELETE_APPOINTMENT = 'delete_appointment',

  // Patient permissions
  VIEW_PATIENTS = 'view_patients',
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',

  // Medical record permissions
  VIEW_MEDICAL_RECORDS = 'view_medical_records',
  CREATE_MEDICAL_RECORD = 'create_medical_record',
  UPDATE_MEDICAL_RECORD = 'update_medical_record',
  DELETE_MEDICAL_RECORD = 'delete_medical_record',

  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Report permissions
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // System permissions
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.KEPALA_KLINIK]: [
    // Full access to everything
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,

    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,

    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORD,
    Permission.UPDATE_MEDICAL_RECORD,
    Permission.DELETE_MEDICAL_RECORD,

    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,

    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,

    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [UserRole.DOKTER]: [
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENT,

    // Patients
    Permission.VIEW_PATIENTS,
    Permission.UPDATE_PATIENT,

    // Medical records - full access
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORD,
    Permission.UPDATE_MEDICAL_RECORD,

    // Reports - view only
    Permission.VIEW_REPORTS,
  ],

  [UserRole.STAF]: [
    // Appointments - full CRUD
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,

    // Patients - full CRUD
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,

    // Medical records - view only
    Permission.VIEW_MEDICAL_RECORDS,

    // Reports - view only
    Permission.VIEW_REPORTS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
  console.log('🔍 hasPermission called:', { roles, permission });
  return roles.some(roleName => {
    const normalizedRole = normalizeRole(roleName);

    if (!normalizedRole) {
      console.warn(`⚠️ Role tidak dikenali: ${roleName}`);
      return false;
    }

    console.log('🔍 After normalize:', {
      roleName,
      normalizedRole,
      rolePermissions: ROLE_PERMISSIONS[normalizedRole],
    });

    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
    const allowed = rolePermissions?.includes(permission) ?? false;

    console.log(`Cek izin untuk ${roleName}:`, {
      permission,
      allowed,
      rolePermissions,
    });

    return allowed;
  });
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(roles, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(roles: string[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(roles, permission));
}

/**
 * Get all permissions for given roles
 */
export function getPermissionsForRoles(roles: string[]): Permission[] {
  const allPermissions = new Set<Permission>();

  roles.forEach(role => {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      console.warn(`⚠️ Role tidak dikenali: ${role}`);
      return;
    }
    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    permissions.forEach(permission => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
}