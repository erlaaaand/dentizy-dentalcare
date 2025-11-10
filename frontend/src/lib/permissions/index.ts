// ============================================
// PERMISSION DEFINITIONS
// ============================================
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

// ============================================
// ROLE-BASED PERMISSIONS MAPPING
// ============================================
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // ✅ Kepala Klinik: Full access
  'kepala_klinik': [
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,

    // Patients
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,

    // Medical Records
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORD,
    Permission.UPDATE_MEDICAL_RECORD,
    Permission.DELETE_MEDICAL_RECORD,

    // Users
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,

    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,

    // System
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],

  // ✅ Dokter: View + Medical Records
  'dokter': [
    // Appointments (view & update)
    Permission.VIEW_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENT,

    // Patients (view only)
    Permission.VIEW_PATIENTS,

    // Medical Records (full access for their patients)
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORD,
    Permission.UPDATE_MEDICAL_RECORD,

    // Reports (view only)
    Permission.VIEW_REPORTS,
  ],

  // ✅ Staf: CRUD Appointments & Patients
  'staf': [
    // Appointments (full CRUD)
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENT,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,

    // Patients (full CRUD)
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENT,
    Permission.UPDATE_PATIENT,
    Permission.DELETE_PATIENT,

    // Medical Records (view only)
    Permission.VIEW_MEDICAL_RECORDS,

    // Reports (view only)
    Permission.VIEW_REPORTS,
  ],
};

/**
 * ✅ Check if user has a specific permission
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
  // 🔧 DEBUG
  console.log('🔍 hasPermission called:', { roles, permission });

  if (!roles || roles.length === 0) {
    console.log('🔴 No roles provided');
    return false;
  }

  // Check each role
  const result = roles.some(role => {
    // Normalize role name (lowercase, trim)
    const normalizedRole = role.toLowerCase().trim();

    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];

    console.log(`🔍 Checking role "${normalizedRole}":`, {
      found: !!rolePermissions,
      permissions: rolePermissions?.length || 0,
      hasPermission: rolePermissions?.includes(permission)
    });

    return rolePermissions?.includes(permission) ?? false;
  });

  console.log(`✅ Final result for ${permission}:`, result);
  return result;
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
    const normalizedRole = role.toLowerCase().trim();
    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    permissions.forEach(permission => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
}