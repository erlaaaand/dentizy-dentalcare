import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';

export interface CopyButtonProps {
    text: string;
    onCopy?: () => void;
    successMessage?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button';
}

const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
};

const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
};

export default function CopyButton({
    text,
    onCopy,
    successMessage = 'Tersalin!',
    className,
    size = 'md',
    variant = 'icon'
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(text);
        
        if (success) {
            setCopied(true);
            onCopy?.();
            
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    };

    if (variant === 'button') {
        return (
            <button
                onClick={handleCopy}
                className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    'bg-gray-100 hover:bg-gray-200 text-gray-700',
                    copied && 'bg-green-100 text-green-700',
                    className
                )}
            >
                {copied ? (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{successMessage}</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Salin</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleCopy}
            className={cn(
                'relative inline-flex items-center justify-center rounded-lg transition-colors',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                copied && 'text-green-600 bg-green-50',
                sizeClasses[size],
                className
            )}
            title={copied ? successMessage : 'Salin'}
        >
            {copied ? (
                <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
}