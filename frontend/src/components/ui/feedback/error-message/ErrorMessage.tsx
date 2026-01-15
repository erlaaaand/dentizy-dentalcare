// components/ui/feedback/ErrorMessage.tsx
import React from 'react';
import { cn } from '@/core';
import { RefreshCw, XCircle } from 'lucide-react';
import { ErrorMessageProps } from './error-message.types';
import { variantConfig, sizeClasses } from './error-message.styles';
import { NetworkError } from './NetworkError';
import { PatientDataError } from './PatientDataError';
import { ValidationError } from './ValidationError';
import { PermissionError } from './PermissionError';
import { DataLoadError } from './DataLoadError';
import { AppointmentError } from './AppointmentError';

export function ErrorMessage({
    message,
    title,
    onRetry,
    onDismiss,
    variant = 'error',
    size = 'md',
    fullWidth = false,
    className,
    retryText = 'Try Again',
    dismissText = 'Dismiss',
    showIcon = true,
    showBorder = true,
    shadow = false,
    action,
    code,
    details,
    compact = false,
}: ErrorMessageProps) {
    const config = variantConfig[variant];
    const sizeClass = sizeClasses[size];
    const IconComponent = config.icon;

    const hasActions = onRetry || onDismiss || action;
    const hasDetails = code || details;

    return (
        <div
            className={cn(
                'rounded-lg transition-all duration-200',
                config.bgColor,
                showBorder && ['border', config.borderColor],
                shadow && 'shadow-sm',
                fullWidth && 'w-full',
                sizeClass.container,
                className
            )}
            role="alert"
            aria-live="polite"
        >
            <div className={cn(
                'flex items-start gap-3',
                compact && 'items-center'
            )}>
                {/* Icon */}
                {showIcon && (
                    <div className={cn(
                        'flex-shrink-0',
                        config.iconColor,
                        compact && 'mt-0'
                    )}>
                        <IconComponent className={sizeClass.icon} />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    {title && (
                        <h3 className={cn(
                            'font-semibold leading-tight',
                            config.titleColor,
                            sizeClass.title
                        )}>
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    <div className={cn(
                        'leading-relaxed',
                        config.textColor,
                        sizeClass.message
                    )}>
                        {message}
                    </div>

                    {/* Error Code */}
                    {code && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-black/10 px-2 py-1 rounded">
                                Error: {code}
                            </span>
                        </div>
                    )}

                    {/* Details */}
                    {details && (
                        <details className="mt-2">
                            <summary className={cn(
                                'text-sm cursor-pointer hover:underline',
                                config.textColor
                            )}>
                                Show details
                            </summary>
                            <pre className={cn(
                                'mt-2 p-3 bg-black/5 rounded text-xs whitespace-pre-wrap font-mono',
                                config.textColor
                            )}>
                                {details}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    {hasActions && (
                        <div className={cn(
                            'flex flex-wrap gap-2 pt-2',
                            compact && 'pt-1'
                        )}>
                            {/* Retry Button */}
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 font-medium transition-colors',
                                        'hover:underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded',
                                        config.textColor,
                                        sizeClass.button
                                    )}
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    {retryText}
                                </button>
                            )}

                            {/* Custom Action */}
                            {action}

                            {/* Dismiss Button */}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 font-medium transition-colors',
                                        'hover:underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded',
                                        config.textColor,
                                        sizeClass.button
                                    )}
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    {dismissText}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Dismiss Button (Top Right) */}
                {onDismiss && !hasActions && (
                    <button
                        onClick={onDismiss}
                        className={cn(
                            'flex-shrink-0 p-1 rounded transition-colors',
                            'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current',
                            config.iconColor
                        )}
                        aria-label="Dismiss error"
                    >
                        <XCircle className={sizeClass.icon} />
                    </button>
                )}
            </div>
        </div>
    );
}

ErrorMessage.Network = NetworkError;
ErrorMessage.DataLoad = DataLoadError;
ErrorMessage.Permission = PermissionError;
ErrorMessage.Validation = ValidationError;
ErrorMessage.PatientData = PatientDataError;
ErrorMessage.Appointment = AppointmentError;