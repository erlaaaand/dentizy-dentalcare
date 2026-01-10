// frontend/src/core/constants/permission.constants.ts
import { ROLES } from './role.constants';

export const PERMISSIONS = {
  HEALTH_CHECK_VIEW: 'health-check:view',

  USERS_CREATE: 'users:create',
  USERS_VIEW: 'users:view',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  AUTH_CREATE: 'auth:create',
  AUTH_VIEW: 'auth:view',
  AUTH_UPDATE: 'auth:update',

  ROLES_VIEW: 'roles:view',

  PATIENTS_CREATE: 'patients:create',
  PATIENTS_VIEW: 'patients:view',
  PATIENTS_UPDATE: 'patients:update',
  PATIENTS_DELETE: 'patients:delete',

  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_UPDATE: 'appointments:update',
  APPOINTMENTS_DELETE: 'appointments:delete',

  PUBLIC_APPOINTMENTS_VIEW: 'public-appointments:view',
  PUBLIC_APPOINTMENTS_CREATE: 'public-appointments:create',

  NOTIFICATIONS_VIEW: 'notifications:view',
  NOTIFICATIONS_CREATE: 'notifications:create',

  MEDICAL_RECORDS_CREATE: 'medical-records:create',
  MEDICAL_RECORDS_VIEW: 'medical-records:view',
  MEDICAL_RECORDS_UPDATE: 'medical-records:update',
  MEDICAL_RECORDS_DELETE: 'medical-records:delete',

  TREATMENTS_CREATE: 'treatments:create',
  TREATMENTS_VIEW: 'treatments:view',
  TREATMENTS_UPDATE: 'treatments:update',
  TREATMENTS_DELETE: 'treatments:delete',

  TREATMENT_CATEGORIES_CREATE: 'treatment-categories:create',
  TREATMENT_CATEGORIES_VIEW: 'treatment-categories:view',
  TREATMENT_CATEGORIES_UPDATE: 'treatment-categories:update',
  TREATMENT_CATEGORIES_DELETE: 'treatment-categories:delete',

  MEDICAL_RECORD_TREATMENTS_CREATE: 'medical-record-treatments:create',
  MEDICAL_RECORD_TREATMENTS_VIEW: 'medical-record-treatments:view',
  MEDICAL_RECORD_TREATMENTS_UPDATE: 'medical-record-treatments:update',
  MEDICAL_RECORD_TREATMENTS_DELETE: 'medical-record-treatments:delete',

  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_UPDATE: 'payments:update',
  PAYMENTS_DELETE: 'payments:delete',

  UPLOADS_CREATE: 'uploads:create',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.KEPALA_KLINIK]: Object.values(PERMISSIONS),

  [ROLES.DOKTER]: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_UPDATE,
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_UPDATE,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.MEDICAL_RECORDS_CREATE,
    PERMISSIONS.MEDICAL_RECORDS_UPDATE,
  ],

  [ROLES.STAF]: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_UPDATE,
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_UPDATE,
  ],
} as const;