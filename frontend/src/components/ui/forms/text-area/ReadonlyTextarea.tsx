// Readonly Textarea for display purposes
import { TextareaProps } from "./text-area.types";
import { Textarea } from "./Textarea";

export function ReadonlyTextarea({
    value,
    label,
    hint,
    ...props
}: Omit<TextareaProps, 'disabled' | 'readOnly'>) {
    return (
        <Textarea
            value={value}
            label={label}
            hint={hint}
            disabled
            variant="filled"
            {...props}
        />
    );
}