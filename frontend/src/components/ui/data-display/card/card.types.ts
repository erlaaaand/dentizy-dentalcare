export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'outline' | 'filled' | 'elevated';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  border?: boolean;
  gradient?: boolean;
  style?: React.CSSProperties;
  fullWidth?: boolean;
  disabled?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  divider?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right' | 'between';
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface CardMediaProps {
  src: string;
  alt?: string;
  className?: string;
  height?: 'sm' | 'md' | 'lg' | 'auto';
  overlay?: boolean;
}

export interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export interface ActionCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description?: string;
  action: React.ReactNode;
  icon?: React.ReactNode;
}