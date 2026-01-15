
export interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';
    showLabel?: boolean;
    label?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    animated?: boolean;
    striped?: boolean;
    className?: string;
    center?: boolean;
}

export interface CircularProgressProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    strokeWidth?: number;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';
    showLabel?: boolean;
    label?: string;
    className?: string;
    center?: boolean;
}

export interface ProgressContainerProps {
    children: React.ReactNode;
    className?: string;
    center?: boolean;
    minHeight?: string;
}

// Page Loading Progress
export interface PageProgressProps {
    title?: string;
    description?: string;
    value: number;
    max?: number;
    size?: 'lg' | 'xl';
    showLabel?: boolean;
}

// Patient File Upload Progress
export interface UploadProgressProps {
    fileName: string;
    value: number;
    status?: 'uploading' | 'processing' | 'complete' | 'error';
    size?: 'sm' | 'md';
}