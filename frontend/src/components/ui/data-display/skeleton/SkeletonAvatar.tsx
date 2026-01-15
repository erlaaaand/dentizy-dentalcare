import { SkeletonAvatarProps } from "./skeleton.types";
import Skeleton from "./Skeleton";

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
    const sizeMap = {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 48,
        xl: 56,
    };

    const sizeValue = typeof size === 'number' ? size : sizeMap[size];

    return (
        <Skeleton
            variant="circular"
            width={sizeValue}
            height={sizeValue}
            className={className}
            shimmer
        />
    );
}