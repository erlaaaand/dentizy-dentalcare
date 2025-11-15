// Form Textarea with standard styling
import { Textarea } from "./Textarea";
import { TextareaProps } from "./text-area.types";

export function FormTextarea(props: Omit<TextareaProps, 'variant' | 'size'>) {
    return <Textarea size="md" variant="default" {...props} />;
}