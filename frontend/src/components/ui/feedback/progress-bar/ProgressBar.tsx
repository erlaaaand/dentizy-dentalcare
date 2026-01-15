// components/ui/feedback/ProgressBar.tsx
import React from 'react';
import { cn } from '@/core';
import { ProgressBarProps } from './progress-bar.types';
import { sizeClasses, variantClasses } from './progress-bar.styles';
import { CircularProgress } from './CircularProgress';
import { ProgressContainer } from './ProgressContainer';
import { PageProgress } from './PageProgress';
import { UploadProgress } from './UploadProgress';

export default function ProgressBar({
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    label,
    labelPosition = 'top',
    animated = false,
    striped = false,
    className,
    center = false,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const progressBarContent = (
        <div className={cn('w-full', className)}>
            {/* Label above progress bar */}
            {(showLabel || label) && labelPosition === 'top' && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <span className={cn('font-medium', sizeClass.label, variantClass.text)}>
                            {label}
                        </span>
                    )}
                    {showLabel && (
                        <span className={cn('font-medium', sizeClass.label, variantClass.text)}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}

            {/* Progress bar container */}
            <div
                className={cn(
                    'w-full rounded-full overflow-hidden',
                    sizeClass.bar,
                    variantClass.background
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label}
            >
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out rounded-full',
                        variantClass.bar,
                        striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]',
                        animated && striped && 'animate-[progress-stripes_1s_linear_infinite]'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Label below progress bar */}
            {(showLabel || label) && labelPosition === 'bottom' && (
                <div className="flex items-center justify-between mt-2">
                    {label && (
                        <span className={cn('font-medium', sizeClass.label, variantClass.text)}>
                            {label}
                        </span>
                    )}
                    {showLabel && (
                        <span className={cn('font-medium', sizeClass.label, variantClass.text)}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    // With side labels
    if ((showLabel || label) && (labelPosition === 'left' || labelPosition === 'right')) {
        const containerClasses = cn(
            'flex items-center gap-3 w-full',
            labelPosition === 'left' ? 'flex-row' : 'flex-row-reverse',
            center && 'justify-center'
        );

        return (
            <div className={containerClasses}>
                <div className="flex-1">
                    {progressBarContent}
                </div>
                <div className={cn('min-w-12 text-center', sizeClass.label, variantClass.text)}>
                    {showLabel && !label && `${Math.round(percentage)}%`}
                    {label && !showLabel && label}
                    {label && showLabel && label}
                </div>
            </div>
        );
    }

    // Just progress bar
    if (center) {
        return (
            <div className="flex justify-center">
                {progressBarContent}
            </div>
        );
    }

    return progressBarContent;
}






// ============================================
// COMPOUND COMPONENT ASSIGNMENTS
// ============================================

ProgressBar.Circular = CircularProgress;
ProgressBar.Container = ProgressContainer;
ProgressBar.Page = PageProgress;
ProgressBar.Upload = UploadProgress;