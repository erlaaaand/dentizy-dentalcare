import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'square';
    className?: string;
    fallbackColor?: string;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
};

const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
};

const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500'
];

function getColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
    src,
    alt,
    name,
    size = 'md',
    shape = 'circle',
    className,
    fallbackColor
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);
    const initials = name ? getInitials(name) : '?';
    const bgColor = fallbackColor || (name ? getColorFromString(name) : 'bg-gray-500');

    if (src && !imageError) {
        return (
            <img
                src={src}
                alt={alt || name || 'Avatar'}
                onError={() => setImageError(true)}
                className={cn(
                    'object-cover',
                    sizeClasses[size],
                    shapeClasses[shape],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center font-semibold text-white',
                sizeClasses[size],
                shapeClasses[shape],
                bgColor,
                className
            )}
            aria-label={name || 'Avatar'}
        >
            {initials}
        </div>
    );
}

export interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function AvatarGroup({ children, max = 5, size = 'md', className }: AvatarGroupProps) {
    const childrenArray = React.Children.toArray(children);
    const displayChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const remainingCount = childrenArray.length - max;

    return (
        <div className={cn('flex -space-x-2', className)}>
            {displayChildren.map((child, index) => (
                <div key={index} className="ring-2 ring-white">
                    {React.isValidElement(child) && React.cloneElement(child as React.ReactElement<AvatarProps>, { size })}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center font-semibold text-white bg-gray-500 ring-2 ring-white',
                        sizeClasses[size],
                        'rounded-full'
                    )}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}