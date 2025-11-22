// ========================================
// frontend/src/components/ui/layout/header/HeaderTitle.tsx
// ========================================
import { cn } from '@/core';
import { HeaderProps } from './header.types';
import { sizeClasses } from './header.styles';

export function HeaderTitle({
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
        <h1 className={cn('font-bold text-gray-900', sizeClass.title, className)}>
            {children}
        </h1>
    );
}