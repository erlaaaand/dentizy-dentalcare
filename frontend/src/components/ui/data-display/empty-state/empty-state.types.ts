export interface EmptyStateProps {
    icon?: React.ReactNode;
    iconType?: 'default' | 'outline' | 'filled' | 'gradient';
    title: string;
    description?: string | React.ReactNode;
    action?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'minimal' | 'bordered' | 'filled';
    align?: 'left' | 'center' | 'right';
    className?: string;
    style?: React.CSSProperties;
    illustration?: React.ReactNode;
    maxWidth?: string;
    shadow?: boolean;
    animate?: boolean;
}

// Empty Data State
export interface EmptyDataStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
    title?: string;
    resource?: string;
    createAction?: React.ReactNode;
    importAction?: React.ReactNode;
}

export interface EmptySearchStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
    title?: string;
    searchQuery?: string;
    resource?: string;
    onClearSearch?: () => void;
}

// Empty Patients State (Dental Clinic Specific)
export interface EmptyPatientsStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
    onAddPatient?: () => void;
    onImportPatients?: () => void;
}

export interface EmptyAppointmentsStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
    onScheduleAppointment?: () => void;
    date?: string;
}

export interface EmptyMedicalRecordsStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
    patientName?: string;
    onAddRecord?: () => void;
}