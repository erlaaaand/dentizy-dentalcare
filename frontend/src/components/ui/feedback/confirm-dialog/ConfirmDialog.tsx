import React from 'react';
import { cn } from '@/core';
import Modal from '../modal/Modal';
import { Button } from '../../button';
import { ConfirmDialogProps } from './confirm-dialog.types';
import { typeConfig, variantClasses, alignClasses, sizeClasses } from './confirm-dialog.styles';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { ArchiveConfirmDialog } from './ArchiveConfirmDialog';
import { PatientDeleteConfirmDialog } from './PatientDeleteConfirmDialog';
import { AppointmentCancelConfirmDialog } from './AppointmentCancelConfirmDialog';

export default function ConfirmDialog({
    isOpen, onClose, onConfirm, title, message, confirmText, cancelText = 'Cancel',
    type = 'warning', variant = 'default', size = 'md', isLoading = false, disabled = false,
    icon: CustomIcon, showIcon = true, confirmVariant, cancelVariant = 'outline', align = 'center',
    overlayClose = true, escapeClose = true, showCloseButton = false, className, contentClassName,
    hideCancel = false, destructive = false, additionalActions,
}: ConfirmDialogProps) {
    const config = typeConfig[type];
    const IconComponent = CustomIcon || config.icon;
    const defaultTitle = title || config.defaultTitle;
    const defaultConfirmText = confirmText || config.defaultConfirmText || 'Confirm';
    const finalConfirmVariant = confirmVariant || config.buttonVariant;

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (e) {
            console.error('Confirm dialog error:', e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={size} showCloseButton={showCloseButton} closeOnOverlayClick={overlayClose && !isLoading} closeOnEscape={escapeClose && !isLoading} className={cn(sizeClasses[size], className)} overlayClassName="bg-black/50 backdrop-blur-sm">
            <div className={cn('flex flex-col', variantClasses[variant], alignClasses[align], contentClassName)}>
                {showIcon && (
                    <div className={cn('mx-auto flex items-center justify-center rounded-full mb-4', config.bgColor, variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12')}>
                        <IconComponent className={cn(config.iconColor, variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6')} />
                    </div>
                )}
                <h3 className={cn('font-semibold text-gray-900 mb-2', variant === 'compact' ? 'text-base' : 'text-lg', variant === 'detailed' && 'text-xl')}>{defaultTitle}</h3>
                <div className={cn('text-gray-600 mb-6', variant === 'compact' ? 'text-sm' : 'text-base', variant === 'detailed' && 'text-lg leading-relaxed')}>{message}</div>
                {additionalActions && <div className="mb-6">{additionalActions}</div>}
                <div className={cn('flex gap-3', align === 'center' ? 'justify-center' : 'justify-end', variant === 'compact' ? 'flex-col sm:flex-row' : 'flex-row')}>
                    {!hideCancel && (
                        <Button variant={cancelVariant} onClick={onClose} disabled={isLoading || disabled} size={variant === 'compact' ? 'sm' : 'md'} className="flex-1 sm:flex-none">
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant={finalConfirmVariant}
                        onClick={handleConfirm}
                        loading={isLoading}
                        disabled={disabled}
                        size={variant === 'compact' ? 'sm' : 'md'}
                        className={cn('flex-1 sm:flex-none', destructive && 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800')}
                    >
                        {defaultConfirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

ConfirmDialog.Delete = DeleteConfirmDialog;
ConfirmDialog.Logout = LogoutConfirmDialog;
ConfirmDialog.Archive = ArchiveConfirmDialog;
ConfirmDialog.PatientDelete = PatientDeleteConfirmDialog;
ConfirmDialog.AppointmentCancel = AppointmentCancelConfirmDialog;