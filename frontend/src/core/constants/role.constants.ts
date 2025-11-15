import { UserRole } from '@/core/types/api';

// Role definitions untuk Klinik Gigi
export const ROLES = {
    KEPALA_KLINIK: UserRole.KEPALA_KLINIK,
    DOKTER: UserRole.DOKTER,
    STAF: UserRole.STAF,
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
    [UserRole.KEPALA_KLINIK]: 'Kepala Klinik',
    [UserRole.DOKTER]: 'Dokter Gigi',
    [UserRole.STAF]: 'Staf Administrasi',
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    [UserRole.KEPALA_KLINIK]: 'Memiliki akses penuh ke semua fitur sistem termasuk laporan dan manajemen pengguna',
    [UserRole.DOKTER]: 'Dapat mengelola janji temu, melihat data pasien, dan membuat rekam medis gigi',
    [UserRole.STAF]: 'Dapat mengelola pendaftaran pasien, penjadwalan janji temu, dan data administrasi',
} as const;

// Role hierarchy (semakin tinggi angka = semakin tinggi wewenang)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.KEPALA_KLINIK]: 3,
    [UserRole.DOKTER]: 2,
    [UserRole.STAF]: 1,
} as const;

/**
 * Normalizes role string to match UserRole enum values
 * Mendukung berbagai variasi penulisan role
 */
export function normalizeRole(role: string): UserRole | null {
    if (!role) return null;

    const normalized = role.toLowerCase().trim().replace(/\s+/g, '_');

    switch (normalized) {
        case 'kepala_klinik':
        case 'kepala klinik':
        case 'kepalaklinik':
        case 'klinik_head':
        case 'head':
            return UserRole.KEPALA_KLINIK;

        case 'dokter':
        case 'dokter_gigi':
        case 'dokter gigi':
        case 'dentist':
        case 'doctor':
            return UserRole.DOKTER;

        case 'staf':
        case 'staff':
        case 'staf_administrasi':
        case 'staf administrasi':
        case 'admin':
        case 'administrasi':
            return UserRole.STAF;

        default:
            console.warn(`⚠️ Role tidak dikenali: "${role}"`);
            return null;
    }
}

/**
 * Normalizes multiple roles
 */
export function normalizeRoles(roles: string[]): UserRole[] {
    return roles
        .map(normalizeRole)
        .filter((role): role is UserRole => role !== null);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string): string {
    const normalized = normalizeRole(role);
    return normalized ? ROLE_DISPLAY_NAMES[normalized] : role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: string): string {
    const normalized = normalizeRole(role);
    return normalized ? ROLE_DESCRIPTIONS[normalized] : '';
}

/**
 * Check if role has higher or equal authority than another role
 */
export function hasHigherOrEqualAuthority(role: string, targetRole: string): boolean {
    const normalizedRole = normalizeRole(role);
    const normalizedTargetRole = normalizeRole(targetRole);

    if (!normalizedRole || !normalizedTargetRole) {
        return false;
    }

    return ROLE_HIERARCHY[normalizedRole] >= ROLE_HIERARCHY[normalizedTargetRole];
}

/**
 * Check if role is Kepala Klinik
 */
export function isKepalaKlinik(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.KEPALA_KLINIK;
}

/**
 * Check if role is Dokter Gigi
 */
export function isDokter(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.DOKTER;
}

/**
 * Check if role is Staf
 */
export function isStaf(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.STAF;
}

/**
 * Check if user can manage patients
 */
export function canManagePatients(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.KEPALA_KLINIK ||
        normalized === UserRole.STAF;
}

/**
 * Check if user can create medical records
 */
export function canCreateMedicalRecords(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.KEPALA_KLINIK ||
        normalized === UserRole.DOKTER;
}

/**
 * Check if user can view reports
 */
export function canViewReports(role: string): boolean {
    const normalized = normalizeRole(role);
    return normalized === UserRole.KEPALA_KLINIK ||
        normalized === UserRole.DOKTER;
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
    return [
        UserRole.KEPALA_KLINIK,
        UserRole.DOKTER,
        UserRole.STAF,
    ];
}

/**
 * Get role options for select/dropdown
 */
export interface RoleOption {
    value: UserRole;
    label: string;
    description: string;
    hierarchy: number;
}

export function getRoleOptions(): RoleOption[] {
    return getAllRoles().map(role => ({
        value: role,
        label: ROLE_DISPLAY_NAMES[role],
        description: ROLE_DESCRIPTIONS[role],
        hierarchy: ROLE_HIERARCHY[role],
    }));
}

/**
 * Get roles that current user can assign
 * Kepala klinik dapat assign semua role
 * Role lain tidak dapat assign role apapun
 */
export function getAssignableRoles(currentUserRole: string): UserRole[] {
    if (isKepalaKlinik(currentUserRole)) {
        return getAllRoles();
    }
    return [];
}