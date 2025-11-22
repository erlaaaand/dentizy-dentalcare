import { AppointmentDatePickerProps } from "./date-picker.types";
import { default as DatePicker } from "./DatePicker";

export function AppointmentDatePicker({
    appointmentType = 'consultation',
    disableWeekends = true,
    ...props
}: AppointmentDatePickerProps) {
    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Minimum tomorrow for appointments
        return today.toISOString().split('T')[0];
    };

    const getPlaceholder = () => {
        const types = {
            consultation: 'Pilih tanggal konsultasi',
            treatment: 'Pilih tanggal perawatan',
            surgery: 'Pilih tanggal operasi',
            followup: 'Pilih tanggal kontrol',
        };
        return types[appointmentType];
    };

    return (
        <DatePicker
            min={getMinDate()}
            placeholder={getPlaceholder()}
            {...props}
        />
    );
}