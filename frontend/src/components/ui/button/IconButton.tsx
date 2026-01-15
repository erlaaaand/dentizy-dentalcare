import React from 'react';
import { IconButtonProps } from './button.types';
import Button from './Button';
import { cn } from '@/core/utils/classnames/cn.utils';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  className,
  size = 'icon', // Default ke ukuran icon kotak
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <Button
      size={size}
      className={cn("rounded-full", className)} // Opsional: default rounded-full untuk icon button
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  );
};