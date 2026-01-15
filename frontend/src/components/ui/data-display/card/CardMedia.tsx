import { CardMediaProps } from "./card.types";
import { cn } from '@/core/utils/classnames/cn.utils';

export function CardMedia({
    src,
    alt = '',
    className,
    height = 'auto',
    overlay = false,
}: CardMediaProps) {
    const heightClasses = {
        sm: 'h-32',
        md: 'h-48',
        lg: 'h-64',
        auto: 'h-auto',
    };

    return (
        <div className={cn(
            'relative overflow-hidden',
            height !== 'auto' && heightClasses[height],
            overlay && 'after:content-[""] after:absolute after:inset-0 after:bg-black after:opacity-20',
            className
        )}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
            />
        </div>
    );
}