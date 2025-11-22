import { default as DatePicker } from "./DatePicker";
import { BirthDatePickerProps } from "./date-picker.types";

export function BirthDatePicker({
    minAge = 0,
    maxAge = 120,
    ...props
}: BirthDatePickerProps) {

    // Menghitung tanggal maksimum (hari ini dikurangi minAge tahun)
    const getMaxDate = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - minAge);
        return today.toISOString().split('T')[0];
    };

    // Menghitung tanggal minimum (hari ini dikurangi maxAge tahun)
    const getMinDate = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - maxAge);
        return today.toISOString().split('T')[0];
    };

    return (
        <DatePicker
            min={getMinDate()}
            max={getMaxDate()}
            placeholder="Pilih tanggal lahir"
            {...props}
        />
    );
}