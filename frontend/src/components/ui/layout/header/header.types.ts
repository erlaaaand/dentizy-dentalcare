export interface HeaderProps {
    className?: string;
    variant?: 'default' | 'minimal' | 'dashboard';
    size?: 'sm' | 'md' | 'lg';
    showWelcome?: boolean;
    showProfile?: boolean;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    welcomeText?: string;
    children?: React.ReactNode;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
    onLogoutClick?: () => void;
}

export interface HeaderMenuOption {
    value: string;
    label: string;
    type?: 'default' | 'danger';
}


export interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userRole?: string;
    username?: string;
    menuOptions?: HeaderMenuOption[];
    onMenuSelect: (value: string) => void;
    size?: HeaderProps['size'];
}
