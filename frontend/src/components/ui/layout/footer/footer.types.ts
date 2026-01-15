
export interface FooterProps {
    className?: string;
    variant?: 'default' | 'minimal' | 'centered';
    size?: 'sm' | 'md' | 'lg';
    showStatus?: boolean;
    showVersion?: boolean;
    copyrightText?: string;
    versionText?: string;
    status?: 'online' | 'offline' | 'maintenance';
    lastSync?: string;
    children?: React.ReactNode;
}