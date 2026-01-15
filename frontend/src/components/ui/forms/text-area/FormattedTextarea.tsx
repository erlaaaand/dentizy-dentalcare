import { FormattedTextareaProps } from "./text-area.types";
import { formatLabels } from "./text-area.types";
import { Textarea } from "./Textarea";

export function FormattedTextarea({
    formattingHint,
    allowedFormats = ['bold', 'italic', 'list'],
    ...props
}: FormattedTextareaProps) {

    const hint = formattingHint || `Format yang didukung: ${allowedFormats
        .map(f => formatLabels[f])
        .join(', ')}`;

    return (
        <div className="space-y-2">
            <Textarea
                hint={hint}
                {...props}
            />
            {allowedFormats.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {allowedFormats.map(format => (
                        <span key={format} className="px-2 py-1 bg-gray-100 rounded">
                            {formatLabels[format]}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}