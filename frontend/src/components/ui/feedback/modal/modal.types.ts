export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    contentClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
    showHeader?: boolean;
    showFooter?: boolean;
    centered?: boolean;
    scrollable?: boolean;
    fullscreen?: boolean;
    onFullscreenToggle?: (fullscreen: boolean) => void;
    backdrop?: 'blur' | 'transparent' | 'opaque';
    animation?: 'fade' | 'slide' | 'scale' | 'none';
    preventScroll?: boolean;
    initialFocusRef?: React.RefObject<HTMLElement>;
    closeButtonPosition?: 'inside' | 'outside';
    overlayBlur?: boolean;
}

// Modal Header Component
export interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    onClose?: () => void;
}

// Modal Body Component
export interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
    scrollable?: boolean;
}

export interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right' | 'between';
}

// Modal Title Component
export interface ModalTitleProps {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface ModalDescriptionProps {
    children: React.ReactNode;
    className?: string;
}