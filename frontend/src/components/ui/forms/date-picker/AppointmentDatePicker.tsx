import { AppointmentDatePickerProps } from "./date-picker.types";
import { default as DatePicker } from "./DatePicker";
import { CLINIC_HOURS } from "@/core/constants/clinic.constants";

export function AppointmentDatePicker({
    appointmentType = 'consultation',
    disableWeekends, // Opsional: bisa override config klinik jika perlu
    ...props
}: AppointmentDatePickerProps) {

    const getMinDate = () => {
        const today = new Date();
        // Minimal booking H+1 (atau sesuai policy klinik)
        today.setDate(today.getDate() + 1);
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

    // Fungsi untuk menonaktifkan hari libur klinik
    // DatePicker harus mendukung prop 'isDateDisabled' atau sejenisnya
    // Jika komponen DatePicker sederhana (input type="date"), validasi ini hanya visual/logika onSelect
    // Untuk input native HTML5, kita tidak bisa mendisable hari spesifik di kalender UI-nya

    return (
        <DatePicker
            min={getMinDate()}
            placeholder={getPlaceholder()}
            // Kita bisa passing prop tambahan untuk validasi manual di onChange jika DatePicker support
            {...props}
        />
    );
}