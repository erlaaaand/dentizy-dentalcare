import { Select } from "./Select";
import { SelectProps } from "./select.types";

// Form Select with standard styling
export function FormSelect(props: Omit<SelectProps, 'variant' | 'size'>) {
    return <Select size="md" variant="default" {...props} />;
}
