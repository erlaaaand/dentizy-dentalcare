export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    active?: boolean;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'bold';
    showCurrentPage?: boolean;
}

export interface BreadcrumbItemComponentProps {
    children: React.ReactNode;
    href?: string;
    icon?: React.ReactNode;
    isCurrent?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'bold';
}

export interface PageBreadcrumbProps extends Omit<BreadcrumbProps, 'variant' | 'size'> {
    title?: string;
    description?: string;
}

export interface HomeBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    items: BreadcrumbItem[];
    homeHref?: string;
    homeLabel?: string;
    homeIcon?: React.ReactNode;
}