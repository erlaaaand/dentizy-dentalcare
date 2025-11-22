import { ButtonGroupProps } from './button.types';
import { cn } from '@/core';

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
    children,
    orientation = 'horizontal',
    className = '',
}) => {
    const groupClasses = cn(
        // Base classes
        'inline-flex rounded-lg shadow-sm',

        // Orientation-specific classes
        orientation === 'horizontal' && 'flex-row space-x-0 divide-x divide-gray-200',
        orientation === 'vertical' && 'flex-col space-y-0 divide-y divide-gray-200',

        // Custom classes
        className
    );
    return (
        <div className={groupClasses} role="group">
            {children}
        </div>
    );
};
