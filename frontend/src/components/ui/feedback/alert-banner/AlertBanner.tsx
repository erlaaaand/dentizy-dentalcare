import { AlertBannerProps } from './alert-banner.types';
import { alertStyles, sizeClasses, variantClasses, positionClasses, defaultIcons } from './alert-banner.styles';
import { X } from 'lucide-react';
import React from 'react';
import { cn } from '@/core';
import { AlertContainer } from './AlertContainer';
import { SuccessAlert } from './SuccessAlert';
import { ErrorAlert } from './ErrorAlert';
import { WarningAlert } from './WarningAlert';
import { InfoAlert } from './InfoAlert';
import { AppointmentAlert } from './AppointmentAlert';

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
    position = 'inline',
    animate = true,
}: AlertBannerProps) {
    const styles = alertStyles[type];
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];
    const positionClass = positionClasses[position];
    const DefaultIcon = defaultIcons[type];

    // Auto-close functionality
    React.useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    // Handle icon rendering
    const renderIcon = () => {
        if (!showIcon) return null;

        const iconElement = CustomIcon ? (
            typeof CustomIcon === 'function' ? (
                <CustomIcon className={cn(sizeClass.icon, styles.icon)} />
            ) : (
                CustomIcon
            )
        ) : (
            <DefaultIcon className={cn(sizeClass.icon, styles.icon)} />
        );

        return (
            <div className={cn('flex-shrink-0', styles.icon)}>
                {iconElement}
            </div>
        );
    };

    const alertContent = (
        <div
            className={cn(
                'relative transition-all duration-300',
                variantClass,
                positionClass,
                sizeClass.container,
                styles.container,
                border && 'border',
                shadow && 'shadow-lg',
                animate && 'animate-in fade-in-0 zoom-in-95',
                variant === 'floating' && 'backdrop-blur-sm bg-opacity-95',
                className
            )}
            role="alert"
            aria-live="polite"
        >
            {/* Accent Border */}
            {variant === 'banner' && (
                <div
                    className={cn(
                        'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
                        styles.accent
                    )}
                />
            )}

            <div className={cn(
                'flex items-start gap-3',
                variant === 'banner' && 'ml-2'
            )}>
                {/* Icon */}
                {renderIcon()}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    {title && (
                        <h3 className={cn(
                            'font-semibold leading-6',
                            sizeClass.title,
                            styles.title
                        )}>
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    <div className={cn(
                        'leading-relaxed',
                        sizeClass.message,
                        styles.message
                    )}>
                        {message}
                    </div>

                    {/* Action */}
                    {action && (
                        <div className="pt-2">
                            {action}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                {dismissible && onClose && (
                    <button
                        onClick={onClose}
                        className={cn(
                            'flex-shrink-0 p-1 rounded-lg transition-all duration-200',
                            'hover:bg-black hover:bg-opacity-5 active:bg-opacity-10',
                            'focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2',
                            styles.icon,
                            sizeClass.icon
                        )}
                        aria-label="Close alert"
                    >
                        <X className="w-full h-full" />
                    </button>
                )}
            </div>

            {/* Progress Bar for Auto-Close */}
            {autoClose && variant === 'toast' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
                    <div
                        className={cn('h-full transition-all duration-linear', styles.accent)}
                        style={{
                            animation: `shrink ${autoClose}ms linear forwards`,
                        }}
                    />
                </div>
            )}
        </div>
    );

    // For floating alerts, wrap in a portal container
    if (variant === 'floating') {
        return alertContent;
    }

    return alertContent;
}

// ============================================
// ALERT CONTAINER COMPONENT (For multiple alerts)
// ============================================





// ============================================
// SPECIALIZED ALERT COMPONENTS
// ============================================

// Success Alert




// Error Alert















// Medical Alert




// ============================================
// COMPOUND COMPONENT ASSIGNMENTS
// ============================================

AlertBanner.Container = AlertContainer;
AlertBanner.Success = SuccessAlert;
AlertBanner.Error = ErrorAlert;
AlertBanner.Warning = WarningAlert;
AlertBanner.Info = InfoAlert;
AlertBanner.Appointment = AppointmentAlert;