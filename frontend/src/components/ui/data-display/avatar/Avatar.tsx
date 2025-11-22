// components/ui/data-display/Avatar.tsx
import React from 'react';
import { cn } from '@/core';
import { getInitials } from '@/core';
import { AvatarProps } from './avatar.types';
import {
    getColorFromString, 
    statusPositionClasses, sizeClasses, 
    shapeClasses, 
    borderClasses, 
    shadowClasses, 
    statusSizeClasses, 
    statusColorClasses,
    getStatusBorderColor
} from './avatar.styles';

export default function Avatar({
    src,
    alt,
    name,
    size = 'md',
    shape = 'circle',
    status = null,
    statusPosition = 'bottom-right',
    className,
    fallbackColor,
    onClick,
    interactive = false,
    border = true,
    borderColor,
    shadow = 'none',
    priority = false,
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const initials = name ? getInitials(name) : '?';
    const bgGradient = fallbackColor || (name ? getColorFromString(name, 'gradient') : 'from-gray-500 to-gray-600');
    const bgSolid = fallbackColor || (name ? getColorFromString(name, 'solid') : 'bg-gray-500');

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const avatarContent = (
        <>
            {/* Image Avatar */}
            {src && !imageError && (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={cn(
                        'object-cover transition-opacity duration-200',
                        imageLoaded ? 'opacity-100' : 'opacity-0',
                        sizeClasses[size],
                        shapeClasses[shape],
                        interactive && 'group-hover:scale-105',
                        border && borderClasses.default,
                        shadowClasses[shadow]
                    )}
                />
            )}

            {/* Fallback Avatar */}
            {(imageError || !src) && (
                <div
                    className={cn(
                        'flex items-center justify-center font-semibold text-white transition-all duration-200',
                        'bg-gradient-to-br',
                        bgGradient,
                        sizeClasses[size],
                        shapeClasses[shape],
                        interactive && 'group-hover:scale-105',
                        border && borderClasses.default,
                        shadowClasses[shadow],
                        !fallbackColor && 'shadow-inner'
                    )}
                    aria-label={name || 'Avatar'}
                >
                    {/* Fallback with solid background for better readability */}
                    <div
                        className={cn(
                            'flex items-center justify-center w-full h-full',
                            shapeClasses[shape],
                            bgSolid
                        )}
                    >
                        <span className={cn(
                            'font-medium drop-shadow-sm',
                            size === 'xs' && 'text-[10px]',
                            size === 'sm' && 'text-xs',
                            size === 'md' && 'text-sm',
                            size === 'lg' && 'text-base',
                            size === 'xl' && 'text-lg',
                            size === '2xl' && 'text-xl',
                            size === '3xl' && 'text-2xl'
                        )}>
                            {initials}
                        </span>
                    </div>
                </div>
            )}

            {/* Loading Skeleton */}
            {src && !imageError && !imageLoaded && (
                <div
                    className={cn(
                        'absolute inset-0 bg-gray-200 animate-pulse',
                        shapeClasses[shape],
                        sizeClasses[size]
                    )}
                />
            )}

            {/* Status Indicator */}
            {status && (
                <div
                    className={cn(
                        'absolute border-2 border-white rounded-full',
                        statusSizeClasses[size],
                        statusColorClasses[status],
                        statusPositionClasses[statusPosition],
                        status === 'online' && 'ring-1 ring-green-500',
                        status === 'busy' && 'ring-1 ring-red-500',
                        status === 'away' && 'ring-1 ring-yellow-500'
                    )}
                />
            )}
        </>
    );

    const wrapperClasses = cn(
        'relative inline-block',
        interactive && 'cursor-pointer transform active:scale-95 transition-transform',
        borderColor && `ring-2 ${borderColor}`,
        status && getStatusBorderColor(status),
        className
    );

    if (onClick || interactive) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(wrapperClasses, 'group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2')}
                aria-label={name ? `Avatar for ${name}` : 'Avatar'}
            >
                {avatarContent}
            </button>
        );
    }

    return (
        <div className={wrapperClasses}>
            {avatarContent}
        </div>
    );
}