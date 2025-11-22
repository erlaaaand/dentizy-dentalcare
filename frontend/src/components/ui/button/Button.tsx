import { forwardRef } from 'react';
import { cn } from '@/core';
import { ButtonProps } from './button.types';
import { LoadingSpinner } from '../feedback/loading-spinner/LoadingSpinner';
import { baseClasses, variantClasses, sizeClasses, roundedClasses, shadowClasses, iconOnlySizeClasses } from './button.styles';

const SPINNER_SIZE_MAP = {
    xs: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'md',
    xl: 'lg',
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', iconOnly = false, fullWidth = false, children, rounded = 'default', shadow = 'none', className = '', disabled, ...props }, ref) => {
        const buttonClasses = cn(
            baseClasses,
            variantClasses[variant],
            iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
            roundedClasses[rounded],
            shadowClasses[shadow],
            fullWidth && 'w-full',
            loading && 'cursor-wait',
            className
        );

        const renderIcon = () => (loading ? <LoadingSpinner size={SPINNER_SIZE_MAP[size]} /> : icon);

        return (
            <button ref={ref} className={buttonClasses} disabled={loading || disabled} {...props}>
                <span className="absolute inset-0 overflow-hidden rounded-inherit">
                    <span className="ripple absolute bg-white opacity-0 rounded-full transform -translate-x-1/2 -translate-y-1/2 group-hover:animate-ripple" />
                </span>
                <span className={cn('relative z-10 flex items-center justify-center gap-2', !iconOnly && 'w-full')}>
                    {iconPosition === 'left' && renderIcon()}
                    {!iconOnly && children && <span className="whitespace-nowrap truncate">{children}</span>}
                    {iconPosition === 'right' && renderIcon()}
                </span>
            </button>
        );
    }
);

Button.displayName = 'Button';
export default Button;