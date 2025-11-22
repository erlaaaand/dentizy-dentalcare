// ============================================
// BUTTONS
// ============================================
export { default as Button } from './button/Button';
export { ButtonGroup } from './button/ButtonGroup';
export { IconButton } from './button/IconButton';
export type { ButtonProps, ButtonGroupProps, IconButtonProps } from './button/button.types';

// ============================================
// DATA DISPLAY
// ============================================
// Avatar
export { default as Avatar } from './data-display/avatar/Avatar';
export { AvatarGroup } from './data-display/avatar/AvatarGroup';
export { AvatarStack } from './data-display/avatar/AvatarStack';
export type { AvatarProps, AvatarGroupProps, AvatarStackProps } from './data-display/avatar/avatar.types';

// Badge
export { default as Badge } from './data-display/badge/Badge';
export { BadgeGroup } from './data-display/badge/BadgeGroup';
export { CountBadge } from './data-display/badge/CountBadge';
export { IconBadge } from './data-display/badge/IconBadge';
export { StatusBadge } from './data-display/badge/StatusBadge';
export type { BadgeProps, BadgeGroupProps, CountBadgeProps, IconBadgeProps, StatusBadgeProps } from './data-display/badge/badge.types';

// Card
export { default as Card } from './data-display/card/Card';
export { ActionCard } from './data-display/card/ActionCard';
export { StatsCard } from './data-display/card/StatsCard';
export { CardBody } from './data-display/card/CardBody';
export { CardDescription } from './data-display/card/CardDescription';
export { CardFooter } from './data-display/card/CardFooter';
export { CardHeader } from './data-display/card/CardHeader';
export { CardMedia } from './data-display/card/CardMedia';
export { CardTitle } from './data-display/card/CardTitle';
export type { CardProps, CardBodyProps, CardFooterProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardMediaProps, StatsCardProps, ActionCardProps } from './data-display/card/card.types';

// DataTable
export { default as DataTable } from './data-display/datatable/DataTable';
export type { DataTableProps } from './data-display/datatable/DataTable';

// EmptyState
export { default as EmptyState } from './data-display/empty-state/EmptyState';
export { EmptyDataState } from './data-display/empty-state/EmptyDataState';
export { EmptySearchState } from './data-display/empty-state/EmptySearchState';
export { EmptyPatientsState } from './data-display/empty-state/EmptyPatientsState';
export { EmptyAppointmentsState } from './data-display/empty-state/EmptyAppointmentsState';
export { EmptyMedicalRecordsState } from './data-display/empty-state/EmptyMedicalRecordsState';
export type { EmptyStateProps, EmptyDataStateProps, EmptySearchStateProps, EmptyPatientsStateProps, EmptyAppointmentsStateProps, EmptyMedicalRecordsStateProps } from './data-display/empty-state/empty-state.types';

// Skeleton
export { default as Skeleton } from './data-display/skeleton/Skeleton';
export { SkeletonAvatar } from './data-display/skeleton/SkeletonAvatar';
export { SkeletonCard } from './data-display/skeleton/SkeletonCard';
export { SkeletonForm } from './data-display/skeleton/SkeletonForm';
export { SkeletonGroup } from './data-display/skeleton/SkeletonGroup';
export { SkeletonProfile } from './data-display/skeleton/SkeletonProfile';
export { SkeletonStats } from './data-display/skeleton/SkeletonStats';
export { SkeletonTable } from './data-display/skeleton/SkeletonTable';
export { SkeletonText } from './data-display/skeleton/SkeletonText';
export type { SkeletonProps, SkeletonGroupProps, SkeletonCardProps, SkeletonAvatarProps, SkeletonTextProps, SkeletonTableProps } from './data-display/skeleton/skeleton.types';

// StatusIndicator
export { default as StatusIndicator } from './data-display/status-indicator/StatusIndicator';
export { AppointmentStatus } from './data-display/status-indicator/AppointmentStatus';
export { StatusIndicatorGroup } from './data-display/status-indicator/StatusIndicatorGroup';
export type { StatusIndicatorProps, StatusIndicatorGroupProps, AppointmentStatusProps } from './data-display/status-indicator/status-indicator.types';

// Table
export { default as Table } from './data-display/table/Table';
export { TableActions } from './data-display/table/TableActions';
export { TableContainer } from './data-display/table/TableContainer';
export { TableFooter } from './data-display/table/TableFooter';
export { SortIcon } from './data-display/table/SortIcon';
export type { TableProps, Column, SortConfig, TableActionsProps, TableFooterProps, TableContainerProps, SortIconProps } from './data-display/table/table.types';

// ============================================
// FEEDBACK
// ============================================
// AlertBanner
export { default as AlertBanner } from './feedback/alert-banner/AlertBanner';
export { AlertContainer } from './feedback/alert-banner/AlertContainer';
export { SuccessAlert } from './feedback/alert-banner/SuccessAlert';
export { ErrorAlert } from './feedback/alert-banner/ErrorAlert';
export { WarningAlert } from './feedback/alert-banner/WarningAlert';
export { InfoAlert } from './feedback/alert-banner/InfoAlert';
export { AppointmentAlert } from './feedback/alert-banner/AppointmentAlert';
export type { AlertBannerProps, AlertContainerProps, AppointmentAlertProps, SuccessAlertProps, ErrorAlertProps, WarningAlertProps, InfoAlertProps } from './feedback/alert-banner/alert-banner.types';

// ConfirmDialog
export { default as ConfirmDialog } from './feedback/confirm-dialog/ConfirmDialog';
export { DeleteConfirmDialog } from './feedback/confirm-dialog/DeleteConfirmDialog';
export { LogoutConfirmDialog } from './feedback/confirm-dialog/LogoutConfirmDialog';
export { ArchiveConfirmDialog } from './feedback/confirm-dialog/ArchiveConfirmDialog';
export { PatientDeleteConfirmDialog } from './feedback/confirm-dialog/PatientDeleteConfirmDialog';
export { AppointmentCancelConfirmDialog } from './feedback/confirm-dialog/AppointmentCancelConfirmDialog';
export type { ConfirmDialogProps, DeleteConfirmDialogProps, LogoutConfirmDialogProps, ArchiveConfirmDialogProps, PatientDeleteConfirmDialogProps, AppointmentCancelConfirmDialogProps } from './feedback/confirm-dialog/confirm-dialog.types';

// ErrorMessage
export { ErrorMessage } from './feedback/error-message/ErrorMessage';
export { NetworkError } from './feedback/error-message/NetworkError';
export { DataLoadError } from './feedback/error-message/DataLoadError';
export { PermissionError } from './feedback/error-message/PermissionError';
export { ValidationError } from './feedback/error-message/ValidationError';
export { PatientDataError } from './feedback/error-message/PatientDataError';
export { AppointmentError } from './feedback/error-message/AppointmentError';
export type { ErrorMessageProps, NetworkErrorProps, DataLoadErrorProps, PermissionErrorProps, ValidationErrorProps, PatientDataErrorProps, AppointmentErrorProps } from './feedback/error-message/error-message.types';

// LoadingSpinner
export { LoadingSpinner } from './feedback/loading-spinner/LoadingSpinner';
export { LoadingContainer } from './feedback/loading-spinner/LoadingContainer';
export { PageLoading } from './feedback/loading-spinner/PageLoading';
export { ButtonLoading } from './feedback/loading-spinner/ButtonLoading';
export { TableLoading } from './feedback/loading-spinner/TableLoadingProps';
export { CardLoading } from './feedback/loading-spinner/CardLoading';
export { PatientLoading } from './feedback/loading-spinner/PatientLoading';
export type { LoadingSpinnerProps, LoadingContainerProps, PageLoadingProps, ButtonLoadingProps, TableLoadingProps, CardLoadingProps, PatientLoadingProps } from './feedback/loading-spinner/loading-spinner.types';

// Modal
export { default as Modal } from './feedback/modal/Modal';
export { ModalHeader } from './feedback/modal/ModalHeader';
export { ModalBody } from './feedback/modal/ModalBody';
export { ModalFooter } from './feedback/modal/ModalFooter';
export { ModalTitle } from './feedback/modal/ModalTitle';
export { ModalDescription } from './feedback/modal/ModalDescription';
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps, ModalTitleProps, ModalDescriptionProps } from './feedback/modal/modal.types';

// ProgressBar
export { default as ProgressBar } from './feedback/progress-bar/ProgressBar';
export { CircularProgress } from './feedback/progress-bar/CircularProgress';
export { ProgressContainer } from './feedback/progress-bar/ProgressContainer';
export { PageProgress } from './feedback/progress-bar/PageProgress';
export { UploadProgress } from './feedback/progress-bar/UploadProgress';
export type { ProgressBarProps, CircularProgressProps, ProgressContainerProps, PageProgressProps, UploadProgressProps } from './feedback/progress-bar/progress-bar.types';

// Toast
export { Toast } from './feedback/toast/Toast';
export { ToastContainer } from './feedback/toast/ToastContainer';
export { SuccessToast } from './feedback/toast/SuccessToast';
export { ErrorToast } from './feedback/toast/ErrorToast';
export { AppointmentToast } from './feedback/toast/AppointmentToast';
export type { ToastProps, ToastContainerProps, ToastMessage, ToastType, ToastPosition, SuccessToastProps, ErrorToastProps, AppointmentToastProps } from './feedback/toast/toast.types';

// ============================================
// FORMS
// ============================================
// Checkbox
export { default as Checkbox } from './forms/checkbox/Checkbox';
export { CheckboxGroup } from './forms/checkbox/CheckboxGroup';
export type { CheckboxProps, CheckboxGroupProps } from './forms/checkbox/checkbox.types';

// DatePicker
export { default as DatePicker } from './forms/date-picker/DatePicker';
export { DatePickerContainer } from './forms/date-picker/DatePickerContainer';
export { AppointmentDatePicker } from './forms/date-picker/AppointmentDatePicker';
export { BirthDatePicker } from './forms/date-picker/BirthDatePicker';
export { DateRangePicker } from './forms/date-picker/DateRangePicker';
export type { DatePickerProps, DateRangePickerProps, DatePickerContainerProps, AppointmentDatePickerProps, BirthDatePickerProps } from './forms/date-picker/date-picker.types';

// FileUpload
export { default as FileUpload } from './forms/file-upload/FileUpload';
export { FileUploadContainer } from './forms/file-upload/FileUploadContainer';
export { PatientDocumentUpload } from './forms/file-upload/PatientDocumentUpload';
export type { FileUploadProps, FileUploadContainerProps, PatientDocumentUploadProps } from './forms/file-upload/file-upload.types';

// Input
export { default as Input } from './forms/input/Input';
export { PasswordInput } from './forms/input/PasswordInput';
export type { InputProps, PasswordInputProps } from './forms/input/input.types';

// RadioGroup
export { default as RadioGroup } from './forms/radio-group/RadioGroup';
export type { RadioGroupProps, RadioOption } from './forms/radio-group/RadioGroup';

// SearchInput
export { default as SearchInput } from './forms/search-input/SearchInput';
export { QuickSearchInput } from './forms/search-input/QuickSearchInput';
export { MinimalSearchInput } from './forms/search-input/MinimalSearchInput';
export { TableSearchInput } from './forms/search-input/TableSearchInput';
export { GlobalSearchInput } from './forms/search-input/GlobalSearchInput';
export { SearchWithResults } from './forms/search-input/SearchWithResults';
export { SearchInputGroup } from './forms/search-input/SearchInputGroup';
export type { SearchInputProps, TableSearchInputProps, SearchWithResultsProps, SearchInputGroupProps } from './forms/search-input/search-input.types';

// Select
export { default as Select } from './forms/select/Select';
export { CompactSelect } from './forms/select/CompactSelect';
export { FormSelect } from './forms/select/FormSelect';
export { StatusSelect } from './forms/select/StatusSelect';
export { SearchableSelect } from './forms/select/SearchableSelect';
export { SelectGroup } from './forms/select/SelectGroup';
export type { SelectProps, SelectOption, SelectGroupProps, SearchableSelectProps, StatusSelectProps } from './forms/select/select.types';

// Textarea
export { default as Textarea } from './forms/text-area/Textarea';
export { CompactTextarea } from './forms/text-area/CompactTextarea';
export { FormTextarea } from './forms/text-area/FormTextarea';
export { DescriptionTextarea } from './forms/text-area/DescriptionTextarea';
export { NotesTextarea } from './forms/text-area/NotesTextarea';
export { ReadonlyTextarea } from './forms/text-area/ReadonlyTextarea';
export { AutoResizeTextarea } from './forms/text-area/AutoResizeTextarea';
export { FormattedTextarea } from './forms/text-area/FormattedTextarea';
export type { TextareaProps, FormattedTextareaProps, DescriptionTextareaProps, NotesTextareaProps } from './forms/text-area/text-area.types';

// TimePicker
export { default as TimePicker } from './forms/time-picker/TimePicker';
export type { TimePickerProps } from './forms/time-picker/TimePicker';

// ============================================
// LAYOUT
// ============================================
// Breadcrumb
export { default as Breadcrumb } from './layout/breadcrumb/Breadcrumb';
export { BreadcrumbItem } from './layout/breadcrumb/BreadcrumbItem';
export { CompactBreadcrumb } from './layout/breadcrumb/CompactBreadcrumb';
export { HomeBreadcrumb } from './layout/breadcrumb/HomeBreadcrumb';
export { PageBreadcrumb } from './layout/breadcrumb/PageBreadcrumb';
export type { BreadcrumbProps, BreadcrumbItem as BreadcrumbItemType, BreadcrumbItemComponentProps, PageBreadcrumbProps, HomeBreadcrumbProps } from './layout/breadcrumb/breadcrumb.types';

// Footer
export { default as Footer } from './layout/footer/Footer';
export { MinimalFooter } from './layout/footer/MinimalFooter';
export { CenteredFooter } from './layout/footer/CenteredFooter';
export { StatusFooter } from './layout/footer/StatusFooter';
export { CompactFooter } from './layout/footer/CompactFooter';
export { FooterSection } from './layout/footer/FooterSection';
export { FooterText } from './layout/footer/FooterText';
export { FooterStatus } from './layout/footer/FooterStatus';
export type { FooterProps } from './layout/footer/footer.types';

// Header
export { default as Header } from './layout/header/Header';
export { ProfileDropdown } from './layout/header/ProfileDropdown';
export { MinimalHeader } from './layout/header/MinimalHeader';
export { DashboardHeader } from './layout/header/DashboardHeader';
export { SimpleHeader } from './layout/header/SimpleHeader';
export { HeaderSection } from './layout/header/HeaderSection';
export { HeaderTitle } from './layout/header/HeaderTitle';
export { HeaderSubtitle } from './layout/header/HeaderSubtitle';
export type { HeaderProps, HeaderMenuOption, ProfileDropdownProps } from './layout/header/header.types';

// PageHeader
export { default as PageHeader } from './layout/page-header/PageHeader';
export { PageHeaderWithTabs } from './layout/page-header/PageHeaderWithTabs';
export { CompactPageHeader } from './layout/page-header/CompactPageHeader';
export { SectionHeader } from './layout/page-header/SectionHeader';
export type { PageHeaderProps, PageHeaderWithTabsProps, CompactPageHeaderProps, SectionHeaderProps } from './layout/page-header/page-header.types';

// Sidebar
export { default as Sidebar } from './layout/sidebar/Sidebar';
export { NavItem, RoleBadge, SidebarSkeleton, EmptyNavigation, SidebarHeader } from './layout/sidebar/SidebarComponents';
export type { NavigationItem, SidebarProps } from './layout/sidebar/sidebar.types';

// ============================================
// NAVIGATION
// ============================================
export { default as Accordion } from './navigation/Accordion';
export type { AccordionProps, AccordionItem } from './navigation/Accordion';

export { default as Dropdown } from './navigation/Dropdown';

export { Pagination } from './navigation/Pagination';

export { Tabs, TabPanel } from './navigation/Tabs';
export type { TabsProps, TabPanelProps, TabItem } from './navigation/Tabs';

// ============================================
// OVERLAYS
// ============================================
export { default as CopyButton } from './overlays/CopyButton';
export type { CopyButtonProps } from './overlays/CopyButton';

export { Popover } from './overlays/Popover';

export { default as Tooltip } from './overlays/Tooltip';
export type { TooltipProps } from './overlays/Tooltip';