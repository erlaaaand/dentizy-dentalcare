// components/ui/data-display/Badge.tsx
import { cn } from '@/core';
import React from 'react';
import { BadgeProps } from './badge.types';
import { iconSizeClasses, dotColors, shapeClasses, sizeClasses, gradientVariants, badgeVariants } from './badge.styles';

// ============================================
// MAIN BADGE COMPONENT
// ============================================

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    shape = 'pill',
    icon: Icon, // ✅ Fixed: lowercase 'icon' to uppercase 'Icon'
    iconPosition = 'left',
    onClick,
    onRemove,
    removable = false,
    interactive = false,
    className,
    style,
    title,
    maxWidth,
    dot = false,
    pulse = false,
    gradient = false,
}: BadgeProps) {
    const isClickable = onClick || interactive;
    const hasRemove = onRemove || removable;

    // Determine base classes
    const baseClasses = cn(
        'inline-flex items-center justify-center font-medium border transition-all duration-200',
        'whitespace-nowrap select-none',
        sizeClasses[size],
        shapeClasses[shape],
        gradient ? gradientVariants[variant] : badgeVariants[variant], // ✅ Fixed: Now properly indexed
        isClickable && 'cursor-pointer transform active:scale-95',
        hasRemove && 'pr-2', // Extra padding for remove button
        pulse && 'animate-pulse',
        className
    );

    // Dot element
    const dotElement = dot && (
        <span
            className={cn(
                'rounded-full mr-1.5 flex-shrink-0',
                iconSizeClasses[size],
                dotColors[variant], // ✅ Fixed: Now properly indexed
                pulse && 'animate-ping'
            )}
        />
    );

    // Icon element - ✅ Fixed: Now using Icon (uppercase)
    const iconElement = Icon && (
        <Icon
            className={cn(
                'flex-shrink-0',
                iconSizeClasses[size],
                iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5'
            )}
        />
    );

    // Remove button
    const removeButton = hasRemove && (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
            }}
            className={cn(
                'ml-1.5 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-current',
                'hover:bg-black hover:bg-opacity-10 active:bg-opacity-20',
                iconSizeClasses[size]
            )}
            aria-label="Remove badge"
        >
            <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        </button>
    );

    // Content with proper styling
    const content = (
        <>
            {/* Left dot/icon */}
            {dotElement}
            {iconPosition === 'left' && iconElement}

            {/* Text content */}
            <span
                className={cn(
                    'truncate',
                    (dot || Icon) && (iconPosition === 'left' ? 'ml-0.5' : 'mr-0.5') // ✅ Fixed: Icon instead of icon
                )}
                style={maxWidth ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined}
            >
                {children}
            </span>

            {/* Right icon */}
            {iconPosition === 'right' && iconElement}

            {/* Remove button */}
            {removeButton}
        </>
    );

    // Render as button if clickable
    if (isClickable) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={baseClasses}
                style={style}
                title={title}
                aria-label={typeof children === 'string' ? children : title}
            >
                {content}
            </button>
        );
    }

    // Render as span if not clickable
    return (
        <span
            className={baseClasses}
            style={style}
            title={title}
        >
            {content}
        </span>
    );
}