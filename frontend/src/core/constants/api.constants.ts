export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/me',
    VERIFY: '/auth/verify',
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: number) => `/appointments/${id}`,
    COMPLETE: (id: number) => `/appointments/${id}/complete`,
    CANCEL: (id: number) => `/appointments/${id}/cancel`,
  },
  
  // Patients
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id: number) => `/patients/${id}`,
    BY_NIK: (nik: string) => `/patients/by-nik/${nik}`,
    BY_MR: (number: string) => `/patients/by-medical-record/${number}`,
    SEARCH: '/patients/search',
    STATISTICS: '/patients/statistics',
    RESTORE: (id: number) => `/patients/${id}/restore`,
  },
  
  // Medical Records
  MEDICAL_RECORDS: {
    BASE: '/medical-records',
    BY_ID: (id: number) => `/medical-records/${id}`,
    BY_APPOINTMENT: (id: number) => `/medical-records/by-appointment/${id}`,
    SEARCH: '/medical-records/search',
    RESTORE: (id: number) => `/medical-records/${id}/restore`,
    HARD_DELETE: (id: number) => `/medical-records/${id}/permanent`,
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    CHANGE_PASSWORD: '/users/change-password',
    RESET_PASSWORD: (id: number) => `/users/${id}/reset-password`,
    CHECK_USERNAME: (username: string) => `/users/check-username/${username}`,
    RECENT: '/users/recent',
    STATISTICS: '/users/statistics',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: number) => `/notifications/${id}`,
    STATISTICS: '/notifications/statistics',
    FAILED: '/notifications/failed',
    RETRY: (id: number) => `/notifications/${id}/retry`,
    RETRY_ALL: '/notifications/retry-all-failed',
  },
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;