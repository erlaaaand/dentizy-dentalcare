export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface BreadcrumbProps {
    items: BreadcrumbItemComponentProps[];
    separator?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'bold';
    showCurrentPage?: boolean;
}

// ============================================
// BREADCRUMB ITEM COMPONENT (for compound pattern)
// ============================================

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

// Breadcrumb with home icon
export interface HomeBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    items: Omit<BreadcrumbItem, 'icon'>[];
    homeHref?: string;
    homeLabel?: string;
}
