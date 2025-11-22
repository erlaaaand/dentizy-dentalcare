// Update: frontend/src/core/index.ts - Complete Export
export * from './config';
export * from './constants';
export * from './types';
export * from './errors';
export * from './services';
export * from './formatters';
export * from './validators';
export * from './hooks';
export * from './utils';
export * from './middleware';

// Re-export commonly used items for convenience
export {
    // Config
    API_CONFIG,
    APP_CONFIG,
    ENV,
    PAGINATION,
    AUTH_CONFIG,
    UI_CONFIG,
    FEATURE_FLAGS,

    // Constants
    ROUTES,
    ROLES,
    PERMISSIONS,
    APPOINTMENT_STATUS,
    GENDER,
    VALIDATION,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STORAGE_KEYS,

    // Services
    authAPI,
    appointmentAPI,
    patientAPI,
    medicalRecordAPI,
    userAPI,
    roleAPI,
    storageService,
    cacheService,

    // Hooks
    useAuth,
    useRole,
    usePermission,
    useToast,
    useModal,
    useConfirm,
    useDebounce,
    useLocalStorage,
    useTable,
    useFetch,
    useMutation,
    useQuery,
    useForm,

    // Utils
    cn,
    formatDate,
    formatTime,
    formatDateTime,
    formatCurrency,
    formatPhoneNumber,
    isValidEmail,
    isValidPhone,
    isValidNIK,

    // Validators
    validateAppointmentForm,
    validateLoginForm,
    validatePatientForm,
    validateMedicalRecordForm,
    validateUserForm,

    // Error Handler
    errorHandler,
    handleAsync,
} from './index';