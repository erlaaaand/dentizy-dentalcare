// components/ui/overlays/Modal.tsx
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
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    overlayClassName,
    contentClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    showHeader = true,
    showFooter = true,
    centered = true,
    scrollable = true,
    fullscreen = false,
    onFullscreenToggle,
    backdrop = 'blur',
    animation = 'fade',
    preventScroll = true,
    initialFocusRef,
    closeButtonPosition = 'inside',
    overlayBlur = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = React.useState(fullscreen);
    const lastActiveElement = useRef<HTMLElement | null>(null);

    // Handle fullscreen toggle
    const handleFullscreenToggle = () => {
        const newFullscreenState = !isFullscreen;
        setIsFullscreen(newFullscreenState);
        onFullscreenToggle?.(newFullscreenState);
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            if (preventScroll) {
                document.body.style.overflow = 'hidden';
            }

            // Store last active element for accessibility
            lastActiveElement.current = document.activeElement as HTMLElement;
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            if (preventScroll) {
                document.body.style.overflow = 'unset';
            }

            // Restore focus when modal closes
            if (lastActiveElement.current) {
                lastActiveElement.current.focus();
            }
        };
    }, [isOpen, onClose, closeOnEscape, preventScroll]);

    // Focus management
    useEffect(() => {
        if (isOpen && modalRef.current) {
            if (initialFocusRef?.current) {
                initialFocusRef.current.focus();
            } else {
                modalRef.current.focus();
            }
        }
    }, [isOpen, initialFocusRef]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Trap focus inside modal
        if (e.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    };

    if (!isOpen) return null;

    const renderCloseButton = (position: 'inside' | 'outside') => {
        if (!showCloseButton) return null;

        const button = (
            <button
                onClick={onClose}
                className={cn(
                    'flex items-center justify-center rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 active:bg-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    position === 'inside'
                        ? 'p-2 text-gray-400 hover:text-gray-600'
                        : 'p-3 bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-800 hover:shadow-xl'
                )}
                aria-label="Close modal"
            >
                <X className={cn(
                    position === 'inside' ? 'w-5 h-5' : 'w-6 h-6'
                )} />
            </button>
        );

        return position === 'outside' ? (
            <div className="absolute -top-12 right-0 z-10">
                {button}
            </div>
        ) : button;
    };

    const renderHeaderActions = () => (
        <div className="flex items-center gap-2 ml-4">
            {onFullscreenToggle && (
                <button
                    onClick={handleFullscreenToggle}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    )}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                    ) : (
                        <Maximize2 className="w-4 h-4" />
                    )}
                </button>
            )}
            {renderCloseButton('inside')}
        </div>
    );

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 overflow-y-auto',
                animationClasses[animation],
                overlayBlur && 'backdrop-blur-sm'
            )}
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 transition-opacity',
                    backdropClasses[backdrop],
                    overlayClassName
                )}
                onClick={handleOverlayClick}
            />

            {/* Modal Container */}
            <div
                className={cn(
                    'flex min-h-full p-4',
                    centered ? 'items-center justify-center' : 'items-start justify-center'
                )}
            >
                {/* Close Button Outside */}
                {closeButtonPosition === 'outside' && renderCloseButton('outside')}

                {/* Modal Content */}
                <div
                    ref={modalRef}
                    tabIndex={-1}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'relative w-full bg-white rounded-xl shadow-2xl transform transition-all',
                        'focus:outline-none',
                        isFullscreen ? fullscreenClasses.true : sizeClasses[size],
                        animationClasses[animation],
                        className
                    )}
                >
                    {/* Header */}
                    {showHeader && (title || description || showCloseButton) && (
                        <div
                            className={cn(
                                'flex items-start justify-between p-6 border-b border-gray-200',
                                headerClassName
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <h3
                                        id="modal-title"
                                        className={cn(
                                            'text-xl font-semibold text-gray-900',
                                            description && 'mb-2'
                                        )}
                                    >
                                        {title}
                                    </h3>
                                )}
                                {description && (
                                    <p
                                        id="modal-description"
                                        className="text-sm text-gray-500 leading-relaxed"
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>
                            {renderHeaderActions()}
                        </div>
                    )}

                    {/* Body */}
                    <div
                        className={cn(
                            scrollable && 'overflow-y-auto',
                            contentClassName,
                            !showHeader && 'pt-6',
                            !showFooter && 'pb-6'
                        )}
                        style={{
                            maxHeight: scrollable
                                ? isFullscreen
                                    ? 'calc(100vh - 200px)'
                                    : 'calc(90vh - 200px)'
                                : 'auto'
                        }}
                    >
                        <div className={cn('p-6', bodyClassName)}>
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    {showFooter && footer && (
                        <div
                            className={cn(
                                'flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl',
                                footerClassName
                            )}
                        >
                            {footer}
                        </div>
                    )}
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