export interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    className?: string;
    animated?: boolean;
    speed?: 'slow' | 'normal' | 'fast';
    color?: 'default' | 'light' | 'dark' | 'blue' | 'green';
    shimmer?: boolean;
}

export interface SkeletonGroupProps {
    children: React.ReactNode;
    className?: string;
    gap?: 'none' | 'sm' | 'md' | 'lg';
    direction?: 'vertical' | 'horizontal';
}

// Card Skeleton
export interface SkeletonCardProps {
    className?: string;
    variant?: 'default' | 'compact' | 'detailed';
    hasImage?: boolean;
    hasActions?: boolean;
}

// Avatar Skeleton
export interface SkeletonAvatarProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    className?: string;
}

// Text Skeleton
export interface SkeletonTextProps {
    lines?: number;
    className?: string;
    randomWidths?: boolean;
    gap?: 'sm' | 'md' | 'lg';
}

// Table Skeleton
export interface SkeletonTableProps {
    rows?: number;
    cols?: number;
    compact?: boolean;
    hasHeader?: boolean;
    hasCheckboxes?: boolean;
}

