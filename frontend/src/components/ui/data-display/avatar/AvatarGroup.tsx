import { AvatarGroupProps } from "./avatar.types";
import React from "react";
import { cn } from '@/core/utils/classnames/cn.utils';
import { spacingClasses, verticalSpacingClasses, sizeClasses } from "./avatar.styles";
import { AvatarProps } from "./avatar.types";

export function AvatarGroup({
    children,
    max = 5,
    size = 'md',
    spacing = 'md',
    className,
    overlap = true,
    direction = 'horizontal',
}: AvatarGroupProps) {
    const childrenArray = React.Children.toArray(children);
    const displayChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const remainingCount = childrenArray.length - max;

    const groupClasses = cn(
        'flex items-center',
        direction === 'horizontal'
            ? cn('flex-row', overlap && spacingClasses[spacing])
            : cn('flex-col', overlap && verticalSpacingClasses[spacing]),
        className
    );

    return (
        <div className={groupClasses}>
            {displayChildren.map((child, index) => (
                <div
                    key={index}
                    className={cn(
                        overlap && 'ring-2 ring-white',
                        !overlap && direction === 'horizontal' && (index !== 0 ? 'ml-2' : ''),
                        !overlap && direction === 'vertical' && (index !== 0 ? 'mt-2' : '')
                    )}
                    style={overlap ? { zIndex: displayChildren.length - index } : undefined}
                >
                    {React.isValidElement(child) &&
                        React.cloneElement(child as React.ReactElement<AvatarProps>, {
                            size,
                            border: false // Disable border in group to avoid double borders
                        })
                    }
                </div>
            ))}

            {remainingCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center font-semibold text-gray-700 bg-gray-200',
                        overlap && 'ring-2 ring-white',
                        sizeClasses[size],
                        'rounded-full',
                        'hover:bg-gray-300 transition-colors'
                    )}
                    style={overlap ? { zIndex: 0 } : undefined}
                >
                    <span className={cn(
                        'font-medium',
                        size === 'xs' && 'text-[10px]',
                        size === 'sm' && 'text-xs',
                        size === 'md' && 'text-sm',
                        size === 'lg' && 'text-base',
                        size === 'xl' && 'text-lg'
                    )}>
                        +{remainingCount}
                    </span>
                </div>
            )}
        </div>
    );
}