import React from 'react';
import { cn } from '@/core/utils/classnames/cn.utils';
import { LoadingSpinnerProps } from './loading-spinner.types';
import { sizeClasses, variantClasses, speedClasses, thicknessClasses } from './loading-spinner.styles';
import { LoadingContainer } from './LoadingContainer';
import { PageLoading } from './PageLoading';
import { ButtonLoading } from './ButtonLoading';
import { TableLoading } from './TableLoadingProps';
import { CardLoading } from './CardLoading';
import { PatientLoading } from './PatientLoading';

export function LoadingSpinner({
    size = 'md', variant = 'default', className, showText = false,
    text = 'Loading...', textPosition = 'bottom', speed = 'normal', thickness = 'normal', center = false,
}: LoadingSpinnerProps) {
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];
    const speedClass = speedClasses[speed];
    const thicknessClass = thicknessClasses[thickness][size];

    const spinnerContent = (
        <div className={cn('relative', className)}>
            <div className={cn('rounded-full', sizeClass.spinner, thicknessClass, variantClass.border)} />
            <div className={cn('absolute top-0 left-0 rounded-full', speedClass, sizeClass.spinner, thicknessClass, variantClass.active, variant === 'gradient' && 'bg-gradient-to-r from-blue-600 to-purple-600')} />
        </div>
    );

    if (showText && text) {
        return (
            <div className={cn('inline-flex items-center gap-3', textPosition === 'bottom' && 'flex-col', textPosition === 'right' && 'flex-row', textPosition === 'left' && 'flex-row-reverse', center && 'justify-center')}>
                {spinnerContent}
                <span className={cn('font-medium', sizeClass.text, variantClass.text)}>{text}</span>
            </div>
        );
    }

    if (center) return <div className="flex justify-center">{spinnerContent}</div>;
    return spinnerContent;
}

LoadingSpinner.Container = LoadingContainer;
LoadingSpinner.Page = PageLoading;
LoadingSpinner.Button = ButtonLoading;
LoadingSpinner.Table = TableLoading;
LoadingSpinner.Card = CardLoading;
LoadingSpinner.Patient = PatientLoading;