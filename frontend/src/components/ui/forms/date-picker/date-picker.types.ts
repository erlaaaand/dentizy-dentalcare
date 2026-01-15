export interface DatePickerProps {
    value?: string;
    onChange?: (date: string) => void;
    label?: string;
    error?: string;
    hint?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'outlined';
    className?: string;
    containerClassName?: string;
}

export interface DateRangePickerProps {
    startDate?: string;
    endDate?: string;
    onChange?: (startDate: string, endDate: string) => void;
    label?: string;
    error?: string;
    hint?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export interface DatePickerContainerProps {
    children: React.ReactNode;
    className?: string;
}

// Dental Appointment Date Picker
export interface AppointmentDatePickerProps extends Omit<DatePickerProps, 'placeholder' | 'min'> {
    appointmentType?: 'consultation' | 'treatment' | 'surgery' | 'followup';
    disableWeekends?: boolean;
}

// Patient Birth Date Picker
export interface BirthDatePickerProps extends Omit<DatePickerProps, 'placeholder' | 'max'> {
    minAge?: number;
    maxAge?: number;
}