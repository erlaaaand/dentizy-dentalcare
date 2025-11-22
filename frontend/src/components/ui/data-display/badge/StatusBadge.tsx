import { StatusBadgeProps } from "./badge.types";
import { badgeVariants } from "./badge.styles";
import { default as Badge } from "./Badge";

export function StatusBadge({ status, showDot = true, ...props }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: keyof typeof badgeVariants; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'error', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'primary', label: 'Published' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      dot={showDot}
      {...props}
    >
      {props.children || config.label}
    </Badge>
  );
}