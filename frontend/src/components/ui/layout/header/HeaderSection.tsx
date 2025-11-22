// ========================================
// frontend/src/components/ui/layout/header/HeaderSection.tsx
// ========================================
import { cn } from '@/core';

export function HeaderSection({
    children,
    position = 'left',
    className,
}: {
    children: React.ReactNode;
    position?: 'left' | 'center' | 'right';
    className?: string;
}) {
    const positionClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    };

    return (
        <div
            className={cn(
                'flex items-center flex-1',
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}