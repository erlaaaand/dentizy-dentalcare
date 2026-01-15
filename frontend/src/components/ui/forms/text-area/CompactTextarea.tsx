// Compact Textarea for tables and forms
import { TextareaProps } from "./text-area.types";
import { Textarea } from "./Textarea";

export function CompactTextarea(props: Omit<TextareaProps, 'size'>) {
    return <Textarea size="sm" variant="minimal" {...props} />;
}