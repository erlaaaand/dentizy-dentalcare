// components/ui/data-display/Card.tsx
import React from 'react';
import { cn } from '@/core/utils';
import { CardProps } from './card.types';
import { paddingClasses, shadowClasses, roundedClasses, variantClasses } from './card.styles';
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
  const isClickable = onClick || interactive;

  const cardClasses = cn(
    'transition-all duration-200',
    // Base styles
    paddingClasses[padding],
    shadowClasses[shadow],
    roundedClasses[rounded],
    variantClasses[variant],
    // Border
    border && 'border',
    // Gradient
    gradient && 'bg-gradient-to-br from-white to-gray-50',
    // Interactive states
    isClickable && !disabled && [
      'cursor-pointer',
      'hover:shadow-lg',
      'hover:-translate-y-0.5',
      'active:translate-y-0',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    ],
    // Disabled state
    disabled && [
      'opacity-60',
      'cursor-not-allowed',
      'pointer-events-none',
    ],
    // Full width
    fullWidth && 'w-full',
    className
  );

  if (isClickable && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClasses}
        style={style}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={cardClasses}
      style={style}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;
