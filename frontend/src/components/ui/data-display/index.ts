// data-display/index.ts

// 1. Export Default Component sebagai Named Export
export { default as Avatar } from './avatar';
export { default as Badge } from './badge';
export { default as Card } from './card';
export { DataTable } from './datatable';
export { default as EmptyState } from './empty-state';
export { Skeleton } from './skeleton';
export { StatusIndicator } from './status-indicator';
export { default as Table } from './table';

// 2. Export Sub-components & Types secara Spesifik (Manual)
// Tujuannya untuk menghindari conflict pada 'sizeClasses', 'variantClasses', dll.

// --- Avatar ---
export {
    AvatarGroup,
    AvatarStack
} from './avatar';
export type { AvatarProps, AvatarGroupProps, AvatarStackProps } from './avatar';

// --- Badge ---
export {
    BadgeGroup,
    CountBadge,
    IconBadge,
    StatusBadge
} from './badge';
export type { BadgeProps, BadgeGroupProps, StatusBadgeProps, CountBadgeProps, IconBadgeProps } from './badge';

// --- Card ---
export {
    ActionCard,
    CardBody,
    CardDescription,
    CardFooter,
    CardHeader,
    CardMedia,
    CardTitle,
    StatsCard
} from './card';
export type {
    CardProps, CardHeaderProps, CardBodyProps, CardFooterProps,
    CardTitleProps, CardDescriptionProps, CardMediaProps,
    StatsCardProps, ActionCardProps
} from './card';

// --- DataTable ---
export type { DataTableProps } from './datatable';

// --- Empty State ---
export {
    EmptyAppointmentsState,
    EmptyDataState,
    EmptyMedicalRecordsState,
    EmptyPatientsState,
    EmptySearchState
} from './empty-state';
export type {
    EmptyStateProps, EmptyDataStateProps, EmptySearchStateProps,
    EmptyPatientsStateProps, EmptyAppointmentsStateProps, EmptyMedicalRecordsStateProps
} from './empty-state';

// --- Skeleton ---
export {
    SkeletonAvatar,
    SkeletonCard,
    SkeletonForm,
    SkeletonGroup,
    SkeletonProfile,
    SkeletonStats,
    SkeletonTable,
    SkeletonText
} from './skeleton';
export type {
    SkeletonProps, SkeletonGroupProps, SkeletonCardProps,
    SkeletonAvatarProps, SkeletonTextProps, SkeletonTableProps
} from './skeleton';

// --- Status Indicator ---
export {
    AppointmentStatus,
    StatusIndicatorGroup
} from './status-indicator';
export type { StatusIndicatorProps, StatusIndicatorGroupProps, AppointmentStatusProps } from './status-indicator';

// --- Table ---
export {
    SortIcon,
    TableActions,
    TableContainer,
    TableFooter
} from './table';
export type {
    TableProps, Column, SortConfig, TableActionsProps,
    TableFooterProps, TableContainerProps
} from './table';