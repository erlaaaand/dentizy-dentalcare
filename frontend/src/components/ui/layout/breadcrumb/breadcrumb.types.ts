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

// breadcrumb.types.ts
export interface PageBreadcrumbProps extends Omit<BreadcrumbProps, 'variant' | 'size' | 'items'> {
    // ✅ Tambahkan 'items' ke Omit, lalu re-define dengan tipe yang benar
    items?: BreadcrumbItem[]; // ← Gunakan BreadcrumbItem[], bukan BreadcrumbItemComponentProps[]
    title?: string;
    description?: string;
}

export interface HomeBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    items: Omit<BreadcrumbItem, 'icon'>[];
    homeHref?: string;
    homeLabel?: string;
    homeIcon?: React.ReactNode; // ✅ Added this
}