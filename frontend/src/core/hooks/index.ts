// frontend/src/core/hooks/index.ts
// Auth
export * from './auth/useAuth';
export * from './auth/useRole';
export * from './auth/usePermission';

// Data - Hanya useTable yang diperlukan
export * from './data/useTable';

// Forms
export * from './forms/useForm';
export * from './forms/useField';

// UI
export * from './ui/useToast';
export * from './ui/useModal';
export * from './ui/useConfirm';
export * from './ui/useDebounce';
export * from './ui/useClickOutside';
export * from './ui/useLocalStorage';
export * from './ui/useMediaQuery';

// API Hooks - Re-export dari services/api
export * from '../services/api/appointment.api';
export * from '../services/api/auth.api';
export * from '../services/api/patient.api';
export * from '../services/api/medicalRecord.api';
export * from '../services/api/user.api';
export * from '../services/api/role.api';
export * from '../services/api/notification.api';