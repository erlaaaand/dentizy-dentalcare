import { CircularProgressProps } from "./progress-bar.types";
import { circularSizeClasses, variantClasses } from "./progress-bar.styles";
import { cn } from "@/core";


export function CircularProgress({
    value,
    max = 100,
    size = 'md',
    strokeWidth,
    variant = 'primary',
    showLabel = true,
    label,
    className,
    center = false,
}: CircularProgressProps) {
    const sizeConfig = circularSizeClasses[size];
    const actualStrokeWidth = strokeWidth || sizeConfig.stroke;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (sizeConfig.size - actualStrokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    const variantClass = variantClasses[variant];

    const circularContent = (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg
                width={sizeConfig.size}
                height={sizeConfig.size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={sizeConfig.size / 2}
                    cy={sizeConfig.size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={actualStrokeWidth}
                    fill="none"
                    className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                    cx={sizeConfig.size / 2}
                    cy={sizeConfig.size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={actualStrokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn(
                        'transition-all duration-500 ease-out',
                        variant === 'gradient'
                            ? 'text-gradient-to-r from-blue-600 to-purple-600'
                            : variantClass.bar
                    )}
                />
            </svg>

            {/* Center label */}
            {(showLabel || label) && (
                <div className="absolute flex flex-col items-center justify-center">
                    {showLabel && (
                        <span className={cn('font-semibold', sizeConfig.label, variantClass.text)}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                    {label && (
                        <span className={cn('text-xs mt-1', variantClass.text)}>
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (center) {
        return (
            <div className="flex justify-center">
                {circularContent}
            </div>
        );
    }

    return circularContent;
}