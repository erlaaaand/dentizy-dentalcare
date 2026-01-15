import { PageProgressProps } from "./progress-bar.types";
import { ProgressContainer } from "./ProgressContainer";
import { default as ProgressBar } from "./ProgressBar";

export function PageProgress({
    title = 'Loading',
    description,
    value,
    max = 100,
    size = 'xl',
    showLabel = true,
}: PageProgressProps) {
    return (
        <ProgressContainer center minHeight="50vh">
            <div className="text-center space-y-6 w-full max-w-md">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                    )}
                </div>
                <ProgressBar
                    value={value}
                    max={max}
                    size={size}
                    variant="primary"
                    showLabel={showLabel}
                    animated
                    striped
                    center
                />
            </div>
        </ProgressContainer>
    );
}