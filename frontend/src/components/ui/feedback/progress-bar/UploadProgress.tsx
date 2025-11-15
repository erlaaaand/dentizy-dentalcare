import { UploadProgressProps } from "./progress-bar.types";
import { default as ProgressBar } from "./ProgressBar";

export function UploadProgress({
    fileName,
    value,
    status = 'uploading',
    size = 'md',
}: UploadProgressProps) {
    const statusVariants = {
        uploading: 'primary',
        processing: 'warning',
        complete: 'success',
        error: 'error',
    } as const;

    const statusLabels = {
        uploading: 'Uploading...',
        processing: 'Processing...',
        complete: 'Complete',
        error: 'Failed',
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate">
                    {fileName}
                </span>
                <span className="text-sm text-gray-500">
                    {statusLabels[status]}
                </span>
            </div>
            <ProgressBar
                value={value}
                size={size}
                variant={statusVariants[status]}
                showLabel={false}
                animated={status === 'uploading' || status === 'processing'}
                striped={status === 'uploading'}
            />
        </div>
    );
}