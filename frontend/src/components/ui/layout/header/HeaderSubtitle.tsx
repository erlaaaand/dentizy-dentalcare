// ========================================
// frontend/src/components/ui/layout/header/HeaderSubtitle.tsx
// ========================================
import { cn } from '@/core';
import { HeaderProps } from './header.types';
import { sizeClasses } from './header.styles';

export function HeaderSubtitle({
    children,
    className,
    size = 'md',
}: {
    children: React.ReactNode;
    className?: string;
    size?: HeaderProps['size'];
}) {
    const sizeClass = sizeClasses[size];

    return (
        <p className={cn('text-gray-600 mt-1', sizeClass.subtitle, className)}>
            {children}
        </p>
    );
}