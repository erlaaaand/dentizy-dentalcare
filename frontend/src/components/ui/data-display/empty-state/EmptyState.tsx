// components/ui/data-display/EmptyState.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { EmptyStateProps } from './empty-state.types';
import { sizeClasses, variantClasses, alignClasses, iconSizeClasses, titleSizeClasses, descriptionSizeClasses, iconTypeClasses } from './empty-state.styles';
import { EmptyAppointmentsState } from './EmptyAppointmentsState';
import { EmptyDataState } from './EmptyDataState';
import { EmptyMedicalRecordsState } from './EmptyMedicalRecordsState';
import { EmptyPatientsState } from './EmptyPatientsState';
import { EmptySearchState } from './EmptySearchState';

export default function EmptyState({
    icon,
    iconType = 'default',
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    variant = 'default',
    align = 'center',
    className,
    style,
    illustration,
    maxWidth = '28rem',
    shadow = false,
    animate = false,
}: EmptyStateProps) {
    const hasActions = action || secondaryAction;
    const hasIcon = icon || illustration;

    return (
        <div
            className={cn(
                'flex flex-col transition-all duration-300',
                sizeClasses[size],
                variantClasses[variant],
                alignClasses[align],
                shadow && 'shadow-sm',
                animate && 'animate-fade-in',
                className
            )}
            style={{ ...style, maxWidth }}
        >
            {/* Illustration (takes priority over icon) */}
            {illustration && (
                <div className={cn(
                    'mb-6',
                    align === 'center' && 'mx-auto',
                    align === 'right' && 'ml-auto'
                )}>
                    {illustration}
                </div>
            )}

            {/* Icon */}
            {!illustration && icon && (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full mb-4 transition-transform',
                        iconSizeClasses[size],
                        iconTypeClasses[iconType],
                        animate && 'hover:scale-110',
                        align === 'center' && 'mx-auto',
                        align === 'right' && 'ml-auto'
                    )}
                >
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className={cn('space-y-2', !hasIcon && 'mt-2')}>
                {/* Title */}
                <h3
                    className={cn(
                        'text-gray-900 leading-tight',
                        titleSizeClasses[size]
                    )}
                >
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p
                        className={cn(
                            'text-gray-500 leading-relaxed',
                            descriptionSizeClasses[size],
                            align === 'center' && 'mx-auto',
                            align === 'right' && 'ml-auto'
                        )}
                        style={{
                            maxWidth: align === 'center' ? '24rem' : 'none',
                        }}
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Actions */}
            {hasActions && (
                <div
                    className={cn(
                        'flex gap-3 mt-6',
                        align === 'center' && 'justify-center',
                        align === 'right' && 'justify-end',
                        secondaryAction ? 'flex-col sm:flex-row' : 'flex'
                    )}
                >
                    {action}
                    {secondaryAction}
                </div>
            )}
        </div>
    );
}

EmptyState.Data = EmptyDataState;
EmptyState.Search = EmptySearchState;
EmptyState.Patients = EmptyPatientsState;
EmptyState.Appointments = EmptyAppointmentsState;
EmptyState.MedicalRecords = EmptyMedicalRecordsState;