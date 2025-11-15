export interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';
    className?: string;
    showText?: boolean;
    text?: string;
    textPosition?: 'bottom' | 'right' | 'left';
    speed?: 'slow' | 'normal' | 'fast';
    thickness?: 'thin' | 'normal' | 'thick';
    center?: boolean;
}

export interface LoadingContainerProps {
    children: React.ReactNode;
    className?: string;
    center?: boolean;
    minHeight?: string;
}

// Page Loading Spinner
export interface PageLoadingProps {
    title?: string;
    description?: string;
    size?: 'lg' | 'xl' | '2xl';
    showText?: boolean;
}

// Button Loading Spinner
export interface ButtonLoadingProps {
    size?: 'xs' | 'sm' | 'md';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

// Table Loading Skeleton
export interface TableLoadingProps {
    rows?: number;
    cols?: number;
    showHeader?: boolean;
}

// Card Loading Skeleton
export interface CardLoadingProps {
    variant?: 'default' | 'compact' | 'detailed';
    showImage?: boolean;
    showActions?: boolean;
}

// Dental Clinic Specific Loading Components
export interface PatientLoadingProps {
    showProfile?: boolean;
    showMedicalHistory?: boolean;
}