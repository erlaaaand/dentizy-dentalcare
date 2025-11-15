export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    shape?: 'circle' | 'square' | 'rounded';
    status?: 'online' | 'offline' | 'busy' | 'away' | null;
    statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    className?: string;
    style?: React.CSSProperties;
    fallbackColor?: string;
    onClick?: () => void;
    interactive?: boolean;
    border?: boolean;
    borderColor?: string;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    priority?: boolean; // For Next.js Image optimization
}

export interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    overlap?: boolean;
    direction?: 'horizontal' | 'vertical';
}

export interface AvatarStackProps {
    avatars: Array<{
        src?: string;
        name: string;
        alt?: string;
    }>;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}