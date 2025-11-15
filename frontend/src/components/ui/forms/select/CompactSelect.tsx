import { SelectProps } from "./select.types";
import { Select } from "./Select";

// Compact Select for tables and forms
export function CompactSelect(props: Omit<SelectProps, 'size'>) {
    return <Select size="sm" variant="minimal" {...props} />;
}