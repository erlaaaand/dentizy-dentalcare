import { default as Badge } from "./Badge";
import { CountBadgeProps } from "./badge.types";

export function CountBadge({
  count,
  max = 99,
  showZero = false,
  variant = 'error',
  size = 'sm',
  ...props
}: CountBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size={size}
      shape="pill"
      {...props}
    >
      {displayCount}
    </Badge>
  );
}