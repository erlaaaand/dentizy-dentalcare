// components/ui/data-display/StatusIndicator.tsx
import React from 'react';
import { cn } from '@/core';
import { StatusIndicatorProps } from './status-indicator.types';
import { statusConfig, sizeClasses } from './status-indicator.styles';
import { StatusIndicatorGroup } from './StatusIndicatorGroup';
import { AppointmentStatus } from './AppointmentStatus';

export default function StatusIndicator({
    status,
    label,
    showDot = true,
    showIcon = false,
    size = 'md',
    variant = 'dot',
    animated = false,
    pulse = false,
    className,
    icon: CustomIcon,
    showLabel = true,
    position = 'left',
    count,
    onClick,
    interactive = false,
}: StatusIndicatorProps) {
    const config = statusConfig[status];
    const sizeClass = sizeClasses[size];
    const displayLabel = label || config.label;
    const IconComponent = CustomIcon || config.icon;

    const hasAction = onClick || interactive;

    // ============================================
    // DOT VARIANT
    // ============================================

    const renderDot = () => (
        <span className="relative inline-flex">
            <span
                className={cn(
                    'rounded-full flex-shrink-0',
                    sizeClass.dot,
                    config.color,
                    pulse && 'animate-pulse'
                )}
            />
            {animated && (
                <span
                    className={cn(
                        'absolute inset-0 rounded-full animate-ping opacity-75',
                        sizeClass.dot,
                        config.color
                    )}
                />
            )}
        </span>
    );

    // ============================================
    // ICON VARIANT
    // ============================================

    const renderIcon = () => (
        <IconComponent
            className={cn(
                'flex-shrink-0',
                sizeClass.icon,
                config.textColor
            )}
        />
    );

    // ============================================
    // BADGE VARIANT
    // ============================================

    const renderBadge = () => (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md font-medium border transition-colors',
                sizeClass.badge,
                config.bgColor,
                config.textColor,
                config.borderColor,
                hasAction && [
                    'cursor-pointer',
                    'hover:shadow-sm',
                    'active:scale-95',
                    'transition-transform'
                ],
                pulse && 'animate-pulse'
            )}
            onClick={onClick}
        >
            {showDot && renderDot()}
            {showIcon && renderIcon()}
            {showLabel && displayLabel}
            {count !== undefined && (
                <span className={cn(
                    'bg-white bg-opacity-50 rounded px-1 min-w-5 text-center',
                    sizeClass.text
                )}>
                    {count}
                </span>
            )}
        </span>
    );

    // ============================================
    // PILL VARIANT
    // ============================================

    const renderPill = () => (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full font-medium border transition-colors',
                sizeClass.pill,
                config.bgColor,
                config.textColor,
                config.borderColor,
                hasAction && [
                    'cursor-pointer',
                    'hover:shadow-sm',
                    'active:scale-95',
                    'transition-transform'
                ],
                pulse && 'animate-pulse'
            )}
            onClick={onClick}
        >
            {showDot && renderDot()}
            {showIcon && renderIcon()}
            {showLabel && displayLabel}
            {count !== undefined && (
                <span className={cn(
                    'bg-white bg-opacity-50 rounded-full px-1.5 min-w-6 h-5 flex items-center justify-center',
                    sizeClass.text
                )}>
                    {count}
                </span>
            )}
        </span>
    );

    // ============================================
    // TEXT VARIANT
    // ============================================

    const renderText = () => (
        <span
            className={cn(
                'inline-flex items-center gap-2 font-medium transition-colors',
                sizeClass.text,
                config.textColor,
                hasAction && 'cursor-pointer hover:underline'
            )}
            onClick={onClick}
        >
            {showDot && renderDot()}
            {showIcon && renderIcon()}
            {displayLabel}
        </span>
    );

    // ============================================
    // ICON-ONLY VARIANT
    // ============================================

    const renderIconOnly = () => (
        <span
            className={cn(
                'inline-flex items-center justify-center transition-transform',
                hasAction && [
                    'cursor-pointer',
                    'hover:scale-110',
                    'active:scale-95'
                ]
            )}
            onClick={onClick}
            title={displayLabel}
        >
            {renderIcon()}
        </span>
    );

    // ============================================
    // MAIN RENDER LOGIC
    // ============================================

    // For icon-only variant
    if (variant === 'icon') {
        return (
            <div className={cn('inline-flex', className)}>
                {renderIconOnly()}
            </div>
        );
    }

    // For other variants
    const content = (
        <div className={cn(
            'inline-flex items-center gap-2',
            position === 'right' && 'flex-row-reverse',
            className
        )}>
            {/* Dot/Icon on left */}
            {position === 'left' && (
                <>
                    {showDot && variant !== 'badge' && variant !== 'pill' && renderDot()}
                    {showIcon && variant !== 'badge' && variant !== 'pill' && renderIcon()}
                </>
            )}

            {/* Main content based on variant */}
            {variant === 'badge' && renderBadge()}
            {variant === 'pill' && renderPill()}
            {variant === 'text' && renderText()}
            {variant === 'dot' && showLabel && (
                <span className={cn(sizeClass.text, config.textColor)}>
                    {displayLabel}
                </span>
            )}

            {/* Dot/Icon on right */}
            {position === 'right' && (
                <>
                    {showDot && variant !== 'badge' && variant !== 'pill' && renderDot()}
                    {showIcon && variant !== 'badge' && variant !== 'pill' && renderIcon()}
                </>
            )}
        </div>
    );

    return content;
}

StatusIndicator.Group = StatusIndicatorGroup;
StatusIndicator.Appointment = AppointmentStatus;