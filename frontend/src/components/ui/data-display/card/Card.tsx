import React from 'react';
import { cn } from '@/core/utils/classnames/cn.utils';
import { CardProps } from './card.types';
import { paddingClasses, shadowClasses, roundedClasses, variantClasses } from './card.styles';

// Sub-components imports
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardMedia } from './CardMedia';
import { CardTitle } from './CardTitle';
import { CardDescription } from './CardDescription';

export default function Card({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  hoverable = false,
  onClick,
  interactive = false,
  variant = 'default',
  rounded = 'lg',
  border = true,
  gradient = false,
  style,
  fullWidth = false,
  disabled = false,
}: CardProps) {
  const isClickable = !!(onClick || interactive);
  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={cn(
        'block text-left transition-all duration-200 overflow-hidden',
        // Base styles
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        variantClasses[variant],
        // Conditional styles
        border && 'border',
        gradient && 'bg-gradient-to-br from-white to-gray-50',
        fullWidth && 'w-full',
        // Interactive states
        isClickable && !disabled && [
          'cursor-pointer',
          'hover:shadow-lg',
          'hover:-translate-y-0.5',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        ],
        // Disabled state
        disabled && [
          'opacity-60',
          'cursor-not-allowed',
          'pointer-events-none',
        ],
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}

// Attach Sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;