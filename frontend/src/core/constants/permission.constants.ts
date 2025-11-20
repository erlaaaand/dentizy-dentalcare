// frontend/src/core/constants/permission.constants.ts

import { UserRole } from '@/core/types/api';

/**
 * Sesuai dengan akses di Swagger untuk setiap role
 */

// Permission definitions
export enum Permission {
    // ============================================
    // APPOINTMENTS
    // ============================================
    VIEW_APPOINTMENTS = 'view_appointments',
    CREATE_APPOINTMENT = 'create_appointment',
    UPDATE_APPOINTMENT = 'update_appointment',
    DELETE_APPOINTMENT = 'delete_appointment',
    COMPLETE_APPOINTMENT = 'complete_appointment',
    CANCEL_APPOINTMENT = 'cancel_appointment',

    // ============================================
    // PATIENTS
    // ============================================
    VIEW_PATIENTS = 'view_patients',
    CREATE_PATIENT = 'create_patient',
    UPDATE_PATIENT = 'update_patient',
    DELETE_PATIENT = 'delete_patient',
    RESTORE_PATIENT = 'restore_patient',

    // ============================================
    // MEDICAL RECORDS
    // ============================================
    VIEW_MEDICAL_RECORDS = 'view_medical_records',
    CREATE_MEDICAL_RECORD = 'create_medical_record',
    UPDATE_MEDICAL_RECORD = 'update_medical_record',
    DELETE_MEDICAL_RECORD = 'delete_medical_record',
    RESTORE_MEDICAL_RECORD = 'restore_medical_record',
    HARD_DELETE_MEDICAL_RECORD = 'hard_delete_medical_record',

    // ============================================
    // USERS
    // ============================================
    VIEW_USERS = 'view_users',
    CREATE_USER = 'create_user',
    UPDATE_USER = 'update_user',
    DELETE_USER = 'delete_user',
    RESET_USER_PASSWORD = 'reset_user_password',
    GENERATE_TEMP_PASSWORD = 'generate_temp_password',

    // ============================================
    // NOTIFICATIONS
    // ============================================
    VIEW_NOTIFICATIONS = 'view_notifications',
    RETRY_NOTIFICATION = 'retry_notification',
    MANAGE_NOTIFICATION_JOBS = 'manage_notification_jobs',

    // ============================================
    // ROLES
    // ============================================
    VIEW_ROLES = 'view_roles',

    // ============================================
    // PROFILE
    // ============================================
    UPDATE_OWN_PROFILE = 'update_own_profile',
    CHANGE_OWN_PASSWORD = 'change_own_password',
}

/**
 * Role-based permissions mapping (Sesuai Swagger)
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // ============================================
    // KEPALA KLINIK - Full Access
    // ============================================
    [UserRole.KEPALA_KLINIK]: [
        // Appointments - Full CRUD + Actions
        Permission.VIEW_APPOINTMENTS,
        Permission.CREATE_APPOINTMENT,
        Permission.UPDATE_APPOINTMENT,
        Permission.DELETE_APPOINTMENT,
        Permission.COMPLETE_APPOINTMENT,
        Permission.CANCEL_APPOINTMENT,

        // Patients - Full CRUD + Restore
        Permission.VIEW_PATIENTS,
        Permission.CREATE_PATIENT,
        Permission.UPDATE_PATIENT,
        Permission.DELETE_PATIENT,
        Permission.RESTORE_PATIENT,

        // Medical Records - Full CRUD + Restore + Hard Delete
        Permission.VIEW_MEDICAL_RECORDS,
        Permission.CREATE_MEDICAL_RECORD,
        Permission.UPDATE_MEDICAL_RECORD,
        Permission.DELETE_MEDICAL_RECORD,
        Permission.RESTORE_MEDICAL_RECORD,
        Permission.HARD_DELETE_MEDICAL_RECORD,

        // Users - Full CRUD + Password Management
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.RESET_USER_PASSWORD,
        Permission.GENERATE_TEMP_PASSWORD,

        // Notifications - Full Access + Job Management
        Permission.VIEW_NOTIFICATIONS,
        Permission.RETRY_NOTIFICATION,
        Permission.MANAGE_NOTIFICATION_JOBS,

        // Roles
        Permission.VIEW_ROLES,

        // Profile
        Permission.UPDATE_OWN_PROFILE,
        Permission.CHANGE_OWN_PASSWORD,
    ],

    // ============================================
    // DOKTER - Medical Focus
    // ============================================
    [UserRole.DOKTER]: [
        // Appointments - View + Complete + Cancel
        Permission.VIEW_APPOINTMENTS,
        Permission.COMPLETE_APPOINTMENT,
        Permission.CANCEL_APPOINTMENT,

        // Patients - View Only (dari swagger: dokter tidak bisa create/update patient)
        Permission.VIEW_PATIENTS,

        // Medical Records - Full CRUD (Core job dokter)
        Permission.VIEW_MEDICAL_RECORDS,
        Permission.CREATE_MEDICAL_RECORD,
        Permission.UPDATE_MEDICAL_RECORD,

        // Profile
        Permission.UPDATE_OWN_PROFILE,
        Permission.CHANGE_OWN_PASSWORD,
    ],

    // ============================================
    // STAF - Administrative Focus
    // ============================================
    [UserRole.STAF]: [
        // Appointments - Full CRUD + Cancel
        Permission.VIEW_APPOINTMENTS,
        Permission.CREATE_APPOINTMENT,
        Permission.UPDATE_APPOINTMENT,
        Permission.DELETE_APPOINTMENT,
        Permission.CANCEL_APPOINTMENT,

        // Patients - Full CRUD (STAF handles patient registration)
        Permission.VIEW_PATIENTS,
        Permission.CREATE_PATIENT,
        Permission.UPDATE_PATIENT,

        // Medical Records - View Only
        Permission.VIEW_MEDICAL_RECORDS,

        // Notifications - View + Retry
        Permission.VIEW_NOTIFICATIONS,
        Permission.RETRY_NOTIFICATION,

        // Profile
        Permission.UPDATE_OWN_PROFILE,
        Permission.CHANGE_OWN_PASSWORD,
    ],
};

/**
 * Normalize role string
 */
function normalizeRole(role: string): UserRole | undefined {
    if (!role) return undefined;
    const formatted = role.toLowerCase().trim();

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

/**
 * Check if a role has a specific permission
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
    return roles.some(roleName => {
        const normalizedRole = normalizeRole(roleName);
        if (!normalizedRole) return false;

        const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
        return rolePermissions?.includes(permission) ?? false;
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
        if (!normalizedRole) return;

        const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
        permissions.forEach(permission => allPermissions.add(permission));
    });

    return Array.from(allPermissions);
}

/**
 * Quick permission checks
 */
export const can = {
    // Appointments
    viewAppointments: (roles: string[]) => hasPermission(roles, Permission.VIEW_APPOINTMENTS),
    createAppointment: (roles: string[]) => hasPermission(roles, Permission.CREATE_APPOINTMENT),
    updateAppointment: (roles: string[]) => hasPermission(roles, Permission.UPDATE_APPOINTMENT),
    deleteAppointment: (roles: string[]) => hasPermission(roles, Permission.DELETE_APPOINTMENT),
    completeAppointment: (roles: string[]) => hasPermission(roles, Permission.COMPLETE_APPOINTMENT),
    cancelAppointment: (roles: string[]) => hasPermission(roles, Permission.CANCEL_APPOINTMENT),

    // Patients
    viewPatients: (roles: string[]) => hasPermission(roles, Permission.VIEW_PATIENTS),
    createPatient: (roles: string[]) => hasPermission(roles, Permission.CREATE_PATIENT),
    updatePatient: (roles: string[]) => hasPermission(roles, Permission.UPDATE_PATIENT),
    deletePatient: (roles: string[]) => hasPermission(roles, Permission.DELETE_PATIENT),

    // Medical Records
    viewMedicalRecords: (roles: string[]) => hasPermission(roles, Permission.VIEW_MEDICAL_RECORDS),
    createMedicalRecord: (roles: string[]) => hasPermission(roles, Permission.CREATE_MEDICAL_RECORD),
    updateMedicalRecord: (roles: string[]) => hasPermission(roles, Permission.UPDATE_MEDICAL_RECORD),
    deleteMedicalRecord: (roles: string[]) => hasPermission(roles, Permission.DELETE_MEDICAL_RECORD),

    // Users
    viewUsers: (roles: string[]) => hasPermission(roles, Permission.VIEW_USERS),
    createUser: (roles: string[]) => hasPermission(roles, Permission.CREATE_USER),
    updateUser: (roles: string[]) => hasPermission(roles, Permission.UPDATE_USER),
    deleteUser: (roles: string[]) => hasPermission(roles, Permission.DELETE_USER),
    resetUserPassword: (roles: string[]) => hasPermission(roles, Permission.RESET_USER_PASSWORD),

    // Notifications
    viewNotifications: (roles: string[]) => hasPermission(roles, Permission.VIEW_NOTIFICATIONS),
    manageNotificationJobs: (roles: string[]) => hasPermission(roles, Permission.MANAGE_NOTIFICATION_JOBS),
};