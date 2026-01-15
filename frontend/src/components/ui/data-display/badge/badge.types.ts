import { LucideIcon } from "lucide-react";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'square' | 'pill';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  maxWidth?: number | string;
  dot?: boolean;
  pulse?: boolean;
  gradient?: boolean;
}

export interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end';
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published';
  showDot?: boolean;
}

export interface CountBadgeProps extends Omit<BadgeProps, 'children' | 'shape'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

export interface IconBadgeProps extends Omit<BadgeProps, 'children'> {
  icon: LucideIcon;
  'aria-label': string;
}