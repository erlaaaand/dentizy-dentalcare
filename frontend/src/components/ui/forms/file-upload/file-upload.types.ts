export interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    onFilesSelect?: (files: File[]) => void;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'outlined';
    className?: string;
    containerClassName?: string;
}

export interface FileUploadContainerProps {
    children: React.ReactNode;
    className?: string;
}

export interface UploadedFile {
    id: string;
    file: File;
    progress?: number;
    status?: 'uploading' | 'success' | 'error';
}

// Treatment Photo Upload
export interface TreatmentPhotoUploadProps extends Omit<FileUploadProps, 'accept' | 'maxSize'> {
    stage?: 'before' | 'during' | 'after';
    maxSize?: number;
}

// Patient Document Upload
export interface PatientDocumentUploadProps extends Omit<FileUploadProps, 'accept' | 'maxSize'> {
    documentType?: 'medical_record' | 'insurance' | 'prescription' | 'referral';
    maxSize?: number;
}
