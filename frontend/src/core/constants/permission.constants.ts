export const PERMISSIONS = {
  // Appointments
  APPOINTMENT_VIEW: 'appointment:view',
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',
  APPOINTMENT_COMPLETE: 'appointment:complete',
  APPOINTMENT_CANCEL: 'appointment:cancel',
  
  // Patients
  PATIENT_VIEW: 'patient:view',
  PATIENT_CREATE: 'patient:create',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',
  
  // Medical Records
  MEDICAL_RECORD_VIEW: 'medical-record:view',
  MEDICAL_RECORD_CREATE: 'medical-record:create',
  MEDICAL_RECORD_UPDATE: 'medical-record:update',
  MEDICAL_RECORD_DELETE: 'medical-record:delete',
  
  // Users
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.KEPALA_KLINIK]: Object.values(PERMISSIONS),
  
  [ROLES.DOKTER]: [
    PERMISSIONS.APPOINTMENT_VIEW,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_COMPLETE,
    PERMISSIONS.PATIENT_VIEW,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.MEDICAL_RECORD_VIEW,
    PERMISSIONS.MEDICAL_RECORD_CREATE,
    PERMISSIONS.MEDICAL_RECORD_UPDATE,
  ],
  
  [ROLES.STAF]: [
    PERMISSIONS.APPOINTMENT_VIEW,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.PATIENT_VIEW,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
  ],
} as const;