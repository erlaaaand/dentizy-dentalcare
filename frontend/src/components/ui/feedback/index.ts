// feedback/index.ts

// --- Alert Banner ---
export {
    AlertBanner,
    AlertContainer,
    AppointmentAlert,
    ErrorAlert,
    InfoAlert,
    SuccessAlert,
    WarningAlert
} from './alert-banner';
export type {
    AlertBannerProps,
    AlertContainerProps,
    AppointmentAlertProps,
    ErrorAlertProps,
    InfoAlertProps,
    SuccessAlertProps,
    WarningAlertProps
} from './alert-banner';

// --- Confirm Dialog ---
export {
    ConfirmDialog,
    AppointmentCancelConfirmDialog,
    ArchiveConfirmDialog,
    DeleteConfirmDialog,
    LogoutConfirmDialog,
    PatientDeleteConfirmDialog
} from './confirm-dialog';
export type {
    ConfirmDialogProps,
    AppointmentCancelConfirmDialogProps,
    ArchiveConfirmDialogProps,
    DeleteConfirmDialogProps,
    LogoutConfirmDialogProps,
    PatientDeleteConfirmDialogProps
} from './confirm-dialog';

// --- Error Message ---
export {
    ErrorMessage,
    AppointmentError,
    DataLoadError,
    NetworkError,
    PatientDataError,
    PermissionError,
    ValidationError
} from './error-message';
export type {
    ErrorMessageProps,
    AppointmentErrorProps,
    DataLoadErrorProps,
    NetworkErrorProps,
    PatientDataErrorProps,
    PermissionErrorProps,
    ValidationErrorProps
} from './error-message';

// --- Loading Spinner ---
export {
    LoadingSpinner,
    ButtonLoading,
    CardLoading,
    LoadingContainer,
    PageLoading,
    PatientLoading,
    TableLoading
} from './loading-spinner';
export type {
    LoadingSpinnerProps,
    ButtonLoadingProps,
    CardLoadingProps,
    LoadingContainerProps,
    PageLoadingProps,
    PatientLoadingProps,
    TableLoadingProps
} from './loading-spinner';

// --- Modal ---
export {
    Modal,
    ModalBody,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle
} from './modal';
export type {
    ModalProps,
    ModalBodyProps,
    ModalDescriptionProps,
    ModalFooterProps,
    ModalHeaderProps,
    ModalTitleProps
} from './modal';

// --- Progress Bar ---
export {
    ProgressBar,
    CircularProgress,
    PageProgress,
    ProgressContainer,
    UploadProgress
} from './progress-bar';
export type {
    ProgressBarProps,
    CircularProgressProps,
    PageProgressProps,
    ProgressContainerProps,
    UploadProgressProps
} from './progress-bar';

// --- Toast ---
export {
    Toast,
    AppointmentToast,
    ErrorToast,
    SuccessToast,
    ToastContainer,
    ToastIcons
} from './toast';
export type {
    ToastProps,
    AppointmentToastProps,
    ErrorToastProps,
    SuccessToastProps,
    ToastContainerProps,
    ToastMessage,
    ToastPosition,
    ToastType
} from './toast';