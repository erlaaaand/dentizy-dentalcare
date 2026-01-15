export interface NavigationItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactElement;
    allowedRoles: string[];
    badge?: {
        text: string;
        color: 'blue' | 'green' | 'yellow' | 'red';
    };
}

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type NavBadgeColor = 'blue' | 'green' | 'yellow' | 'red';

export interface Role {
    name: string;
}

export interface SidebarProps {
    className?: string;
}