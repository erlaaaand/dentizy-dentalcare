import React, { useEffect, useRef } from 'react';
import { cn } from '@/core';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { ModalProps } from './modal.types';
import { ModalBody } from './ModalBody';
import { ModalHeader } from './ModalHeader';
import { ModalDescription } from './ModalDescription';
import { ModalTitle } from './ModalTitle';
import { ModalFooter } from './ModalFooter';
import { animationClasses, backdropClasses, fullscreenClasses, sizeClasses } from './modal.styles';

export default function Modal({
    isOpen, onClose, title, description, children, footer, size = 'md',
    closeOnOverlayClick = true, closeOnEscape = true, showCloseButton = true,
    className, overlayClassName, contentClassName, headerClassName, bodyClassName, footerClassName,
    showHeader = true, showFooter = true, centered = true, scrollable = true,
    fullscreen = false, onFullscreenToggle, backdrop = 'blur', animation = 'fade',
    preventScroll = true, initialFocusRef, closeButtonPosition = 'inside', overlayBlur = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = React.useState(fullscreen);
    const lastActiveElement = useRef<HTMLElement | null>(null);

    const handleFullscreenToggle = () => {
        const newState = !isFullscreen;
        setIsFullscreen(newState);
        onFullscreenToggle?.(newState);
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape' && isOpen) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            if (preventScroll) document.body.style.overflow = 'hidden';
            lastActiveElement.current = document.activeElement as HTMLElement;
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            if (preventScroll) document.body.style.overflow = 'unset';
            lastActiveElement.current?.focus();
        };
    }, [isOpen, onClose, closeOnEscape, preventScroll]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            initialFocusRef?.current ? initialFocusRef.current.focus() : modalRef.current.focus();
        }
    }, [isOpen, initialFocusRef]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    const CloseButton = ({ position }: { position: 'inside' | 'outside' }) => {
        if (!showCloseButton) return null;
        const isInside = position === 'inside';
        return (
            <button
                onClick={onClose}
                className={cn(
                    'flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isInside ? 'p-2 text-gray-400 hover:text-gray-600' : 'p-3 bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-800'
                )}
                aria-label="Close modal"
            >
                <X className={isInside ? 'w-5 h-5' : 'w-6 h-6'} />
            </button>
        );
    };

    return (
        <div className={cn('fixed inset-0 z-50 overflow-y-auto', animationClasses[animation], overlayBlur && 'backdrop-blur-sm')} role="dialog" aria-modal="true">
            <div className={cn('fixed inset-0 transition-opacity', backdropClasses[backdrop], overlayClassName)} onClick={handleOverlayClick} />
            <div className={cn('flex min-h-full p-4', centered ? 'items-center justify-center' : 'items-start justify-center')}>
                {closeButtonPosition === 'outside' && <div className="absolute -top-12 right-0 z-10"><CloseButton position="outside" /></div>}
                <div
                    ref={modalRef}
                    tabIndex={-1}
                    className={cn('relative w-full bg-white rounded-xl shadow-2xl transform transition-all focus:outline-none', isFullscreen ? fullscreenClasses.true : sizeClasses[size], className)}
                >
                    {showHeader && (title || description || showCloseButton) && (
                        <div className={cn('flex items-start justify-between p-6 border-b border-gray-200', headerClassName)}>
                            <div className="flex-1 min-w-0">
                                {title && <h3 id="modal-title" className={cn('text-xl font-semibold text-gray-900', description && 'mb-2')}>{title}</h3>}
                                {description && <p id="modal-description" className="text-sm text-gray-500 leading-relaxed">{description}</p>}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {onFullscreenToggle && (
                                    <button onClick={handleFullscreenToggle} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                )}
                                <CloseButton position="inside" />
                            </div>
                        </div>
                    )}
                    <div className={cn(scrollable && 'overflow-y-auto', contentClassName, !showHeader && 'pt-6', !showFooter && 'pb-6')} style={{ maxHeight: scrollable ? (isFullscreen ? 'calc(100vh - 200px)' : 'calc(90vh - 200px)') : 'auto' }}>
                        <div className={cn('p-6', bodyClassName)}>{children}</div>
                    </div>
                    {showFooter && footer && <div className={cn('flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl', footerClassName)}>{footer}</div>}
                </div>
            </div>
        </div>
    );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;