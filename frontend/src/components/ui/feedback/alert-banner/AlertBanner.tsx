import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import { cn } from '@/core';
import type { AlertBannerProps } from './alert-banner.types';
import { alertStyles, sizeClasses, variantClasses } from './alert-banner.styles';

import { AlertContainer } from './AlertContainer';
import { SuccessAlert } from './SuccessAlert';
import { ErrorAlert } from './ErrorAlert';
import { WarningAlert } from './WarningAlert';
import { InfoAlert } from './InfoAlert';
import { AppointmentAlert } from './AppointmentAlert';

const ICONS = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    neutral: Bell,
};

export default function AlertBanner({
    type = 'info',
    title,
    message,
    onClose,
    className,
    icon: CustomIcon,
    action,
    size = 'md',
    variant = 'banner',
    dismissible = true,
    autoClose,
    showIcon = true,
    border = true,
    shadow = false,
    animate = true,
}: AlertBannerProps) {
    const styles = alertStyles[type];
    const sizeClass = sizeClasses[size];

    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const IconComponent = CustomIcon || ICONS[type];

    return (
        <div
            role="alert"
            className={cn(
                'relative flex w-full overflow-hidden',
                styles.container,
                sizeClass.container,
                variantClasses[variant],
                border && 'border',
                shadow && 'shadow-sm',
                animate && 'animate-in fade-in slide-in-from-top-2 duration-300',
                className
            )}
        >
            {variant === 'banner' && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.accent)} />
            )}

            {showIcon && (
                <div className={cn('flex-shrink-0 mr-3', styles.icon)}>
                    {React.isValidElement(IconComponent)
                        ? IconComponent
                        : <IconComponent className={sizeClass.icon} />}
                </div>
            )}

            <div className="flex-1 min-w-0">
                {title && (
                    <h5 className={cn('font-semibold mb-1', sizeClass.title, styles.title)}>
                        {title}
                    </h5>
                )}
                <div className={cn('text-sm opacity-90', sizeClass.message, styles.message)}>
                    {message}
                </div>
                {action && <div className="mt-3">{action}</div>}
            </div>

            {dismissible && onClose && (
                <button
                    onClick={onClose}
                    className={cn(
                        'flex-shrink-0 ml-3 rounded-md p-1 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-offset-1',
                        styles.icon,
                        'hover:bg-black/5'
                    )}
                    aria-label="Dismiss"
                >
                    <X className={sizeClass.icon} />
                </button>
            )}
        </div>
    );
}

AlertBanner.Container = AlertContainer;
AlertBanner.Success = SuccessAlert;
AlertBanner.Error = ErrorAlert;
AlertBanner.Warning = WarningAlert;
AlertBanner.Info = InfoAlert;
AlertBanner.Appointment = AppointmentAlert;