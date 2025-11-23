// frontend/src/features/dashboard/types/dashboard.types.ts

export interface PatientStats {
    total: number;
    new_this_month: number;
}

export interface UserStats {
    total: number;
    active: number;
}

export interface StatCardData {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
}

export interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    color?: string;
}

export interface AppointmentListItem {
    id: string;
    time: string;
    patientName: string;
    complaint?: string;
    status: string;
}