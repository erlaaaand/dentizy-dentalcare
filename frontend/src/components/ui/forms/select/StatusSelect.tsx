import { StatusSelectProps } from "./select.types";
import { SelectOption } from "./select.types";
import { Select } from "./Select";

export function StatusSelect({
    statusOptions = ['active', 'inactive', 'pending', 'completed'],
    includeAll = true,
    placeholder = 'Pilih status',
    ...props
}: StatusSelectProps) {
    const statusLabels = {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        pending: 'Menunggu',
        completed: 'Selesai',
        all: 'Semua Status',
    };

    const options: SelectOption[] = [
        ...(includeAll ? [{ value: 'all', label: statusLabels.all }] : []),
        ...statusOptions.map(status => ({
            value: status,
            label: statusLabels[status],
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