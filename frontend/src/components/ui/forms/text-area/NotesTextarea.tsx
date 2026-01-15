import { Textarea } from "./Textarea";
import { NotesTextareaProps } from "./text-area.types";

export function NotesTextarea({
    maxLength = 1000,
    showCharCount = true,
    resize = 'vertical',
    ...props
}: NotesTextareaProps) {
    return (
        <Textarea
            size="lg"
            variant="filled"
            maxLength={maxLength}
            showCharCount={showCharCount}
            resize={resize}
            placeholder="Catatan klinis..."
            {...props}
        />
    );
}