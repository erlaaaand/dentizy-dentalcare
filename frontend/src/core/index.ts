// frontend/src/core/index.ts

// Config
export * from './config';

// Constants
export * from './constants';

// Types
export * from './types';

// Errors
export * from './errors';

// Services
export * from './services';

// Formatters
export * from './formatters';

// Validators
export * from './validators';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Middleware
export * from './middleware';

// Re-export commonly used items
export {
    API_CONFIG,
    APP_CONFIG,
    ENV,
    PAGINATION,
    AUTH_CONFIG,
    UI_CONFIG,
    FEATURE_FLAGS,
} from './config';

export {
    ROUTES,
    ROLES,
    PERMISSIONS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    VALIDATION_MESSAGES,
    STATUS_LABELS,
    STATUS_COLORS,
    GENDER_LABELS,
} from './constants';

export { cacheService, storageService, sessionStorageService, customInstance, setupInterceptors } from './services';

export { useAuth, useRole, usePermission, useToast, useModal, useConfirm, useDebounce, useLocalStorage, useTable, useForm } from './hooks';

// cn
export { cn } from './utils/classnames/cn.utils';

// date
export { formatDate, formatTime, formatDateTime } from './utils/date/date.utils';

// format
export { formatCurrency } from './utils/date/format.utils';

// validations
export { isValidEmail, isValidPhone, isValidNIK } from './utils/validations/validation.utils';

export { errorHandler, handleAsync } from './errors';