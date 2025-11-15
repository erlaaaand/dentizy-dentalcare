import { IconBadgeProps } from "./badge.types";
import { Badge } from "./Badge";
import { iconSizeClasses } from "./badge.styles";

export function IconBadge({ icon: Icon, 'aria-label': ariaLabel, ...props }: IconBadgeProps) {
    return (
        <Badge {...props} aria-label={ariaLabel}>
            <Icon className={iconSizeClasses[props.size || 'md']} />
        </Badge>
    );
}