import React from 'react';
import { ButtonGroupProps } from './button.types';
import { cn } from '@/core/utils/classnames/cn.utils';

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex rounded-lg shadow-sm',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        // Mengatur border radius dan border collapse untuk anak-anak tombol
        '[&>button]:rounded-none [&>button]:shadow-none',
        '[&>button:first-child]:rounded-l-lg',
        '[&>button:last-child]:rounded-r-lg',
        '[&>button:not(:last-child)]:border-r-0',
        orientation === 'vertical' && [
            '[&>button]:w-full',
            '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-bl-none',
            '[&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-tr-none',
            '[&>button:not(:last-child)]:border-b-0 [&>button:not(:last-child)]:border-r'
        ],
        className
      )}
    >
      {children}
    </div>
  );
};