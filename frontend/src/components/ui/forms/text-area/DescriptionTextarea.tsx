// Description Textarea for product/patient descriptions
import { DescriptionTextareaProps } from "./text-area.types";
import { Textarea } from "./Textarea";

export function DescriptionTextarea({
    maxLength = 500,
    showCharCount = true,
    ...props
}: DescriptionTextareaProps) {
    return (
        <Textarea
            size="md"
            variant="default"
            maxLength={maxLength}
            showCharCount={showCharCount}
            placeholder="Masukkan deskripsi..."
            {...props}
        />
    );
}