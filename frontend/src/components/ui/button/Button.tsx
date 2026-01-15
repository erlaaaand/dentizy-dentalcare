import React, { forwardRef } from 'react';
import { cn } from '@/core/utils/classnames/cn.utils'; // Sesuaikan path ini dengan utility cn Anda
import { ButtonProps } from './button.types';
import { buttonVariants } from './button.styles';
import { LoadingSpinner } from '../feedback/loading-spinner/LoadingSpinner';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false, 
    icon, 
    iconPosition = 'left', 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    
    // Tentukan ukuran spinner berdasarkan ukuran tombol
    const spinnerSize = size === 'xs' || size === 'sm' ? 'sm' : 'md';

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={spinnerSize} className={children ? "mr-2" : ""} />
        ) : (
          icon && iconPosition === 'left' && (
            <span className={cn("inline-flex shrink-0", children && "mr-2")}>
              {icon}
            </span>
          )
        )}

        {children}

        {!loading && icon && iconPosition === 'right' && (
          <span className={cn("inline-flex shrink-0", children && "ml-2")}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;