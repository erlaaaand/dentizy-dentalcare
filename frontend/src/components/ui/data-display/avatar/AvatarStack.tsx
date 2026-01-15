import { cn } from '@/core/utils/classnames/cn.utils';
import { AvatarStackProps } from "./avatar.types";
import Avatar from "./Avatar";
import { sizeClasses } from "./avatar.styles";

export function AvatarStack({ avatars, max = 5, size = 'md', className }: AvatarStackProps) {
    const displayAvatars = max ? avatars.slice(0, max) : avatars;
    const remainingCount = avatars.length - max;

    return (
        <div className={cn('flex -space-x-2', className)}>
            {displayAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    name={avatar.name}
                    alt={avatar.alt}
                    size={size}
                    className="ring-2 ring-white"
                    style={{ zIndex: displayAvatars.length - index }}
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center font-semibold text-gray-700 bg-gray-200 ring-2 ring-white',
                        sizeClasses[size],
                        'rounded-full'
                    )}
                    style={{ zIndex: 0 }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}