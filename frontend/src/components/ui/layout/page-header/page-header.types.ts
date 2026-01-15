import { BreadcrumbItemComponentProps } from "../breadcrumb"; // Sesuaikan path jika perlu

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItemComponentProps[]; // Gunakan tipe props-nya
    actions?: React.ReactNode;
    backButton?: {
        label?: string;
        onClick: () => void;
    };
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    align?: 'left' | 'center';
}


export interface SectionHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export interface PageHeaderWithTabsProps extends Omit<PageHeaderProps, 'actions'> {
    tabs: Array<{
        id: string;
        label: string;
        count?: number;
        icon?: React.ReactNode;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    actions?: React.ReactNode;
    tabVariant?: 'default' | 'pills' | 'underline';
}

export interface CompactPageHeaderProps {
    title: string;
    subtitle?: string;
    onClose?: () => void;
    className?: string;
    showBorder?: boolean;
}