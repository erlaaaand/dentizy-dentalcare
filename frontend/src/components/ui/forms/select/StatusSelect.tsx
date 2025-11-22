import { StatusSelectProps, SelectOption } from "./select.types";
import { Select } from "./Select";
import { STATUS_LABELS } from "@/core";

export function StatusSelect({
    statusOptions = ['dijadwalkan', 'selesai', 'dibatalkan'], // Default ke Appointment Status
    includeAll = true,
    placeholder = 'Pilih status',
    ...props
}: StatusSelectProps) {

    // Gunakan STATUS_LABELS dari core, fallback ke title case jika tidak ada
    const getLabel = (status: string) => {
        // Cek apakah ada di STATUS_LABELS (biasanya untuk appointment)
        const coreLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS];
        if (coreLabel) return coreLabel;

        // Fallback manual untuk status lain
        const otherLabels: Record<string, string> = {
            active: 'Aktif',
            inactive: 'Tidak Aktif',
            pending: 'Menunggu',
            completed: 'Selesai',
        };
        return otherLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    };

    const options: SelectOption[] = [
        ...(includeAll ? [{ value: 'all', label: 'Semua Status' }] : []),
        ...(statusOptions as string[]).map(status => ({
            value: status,
            label: getLabel(status),
        })),
    ];

    return (
        <Select
            options={options}
            placeholder={placeholder}
            size="sm"
            variant="minimal"
            {...props}
        />
    );
}