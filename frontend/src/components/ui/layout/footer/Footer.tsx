'use client';

import React from 'react';
import { cn } from '@/core/utils';
import { FooterProps } from './footer.types';
import { sizeClasses, variantClasses, statusText } from './footer.styles';
import { StatusIndicator, SyncIcon } from './Icon.styles';
import { MinimalFooter } from './MinimalFooter';
import { CenteredFooter } from './CenteredFooter';
import { StatusFooter } from './StatusFooter';
import { CompactFooter } from './CompactFooter';
import { FooterSection } from './FooterSection';
import { FooterText } from './FooterText';
import { FooterStatus } from './FooterStatus';

export function Footer({
    className,
    variant = 'default',
    size = 'md',
    showStatus = true,
    showVersion = true,
    copyrightText = '© 2025 Dentizy Dentalcare. All rights reserved.',
    versionText = 'Version 2.1.0',
    status = 'online',
    lastSync = 'Terakhir disinkron: baru saja',
    children,
}: FooterProps) {
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    // If children are provided, render custom content
    if (children) {
        return (
            <footer
                id="app-footer"
                className={cn(
                    variantClass,
                    sizeClass.container,
                    className
                )}
            >
                {children}
            </footer>
        );
    }

    return (
        <footer
            id="app-footer"
            className={cn(
                variantClass,
                sizeClass.container,
                className
            )}
        >
            <div className={cn(
                'flex items-center justify-between',
                variant === 'centered' && 'flex-col space-y-3'
            )}>
                {/* Left Section - Copyright & Version */}
                <div
                    id="footer-info"
                    className={cn(
                        'flex items-center space-x-4',
                        variant === 'centered' && 'justify-center'
                    )}
                >
                    <p className={cn('text-gray-500', sizeClass.text)}>
                        {copyrightText}
                    </p>

                    {showVersion && (
                        <>
                            <span className="text-gray-300">|</span>
                            <p className={cn('text-gray-500', sizeClass.text)}>
                                {versionText}
                            </p>
                        </>
                    )}
                </div>

                {/* Right Section - Status & Sync */}
                {showStatus && (
                    <div
                        id="footer-status"
                        className={cn(
                            'flex items-center space-x-4',
                            variant === 'centered' && 'justify-center'
                        )}
                    >
                        {/* System Status */}
                        <div className="flex items-center space-x-2">
                            <StatusIndicator status={status} size={size} />
                            <span className={cn('text-gray-500', sizeClass.text)}>
                                {statusText[status]}
                            </span>
                        </div>

                        {/* Last Sync */}
                        <div className="flex items-center space-x-2">
                            <SyncIcon className={cn('text-gray-500', sizeClass.icon)} />
                            <span className={cn('text-gray-500', sizeClass.text)}>
                                {lastSync}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
}

// Create main component with compound pattern
const FooterComponent = Object.assign(Footer, {
    Minimal: MinimalFooter,
    Centered: CenteredFooter,
    Status: StatusFooter,
    Compact: CompactFooter,
    Section: FooterSection,
    Text: FooterText,
    StatusIndicator: FooterStatus,
});

export default FooterComponent;