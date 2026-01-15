'use client';
import React, { useEffect, forwardRef } from 'react';
import { cn } from '@/core';
import { ProfileDropdownProps } from './header.types';
import { sizeClasses, defaultMenuOptions } from './header.styles';
import { useDropdownAnimation } from './useDropdownAnimation';

export const ProfileDropdown = forwardRef<HTMLDivElement, ProfileDropdownProps>(
    ({ isOpen, onClose, userName, userRole, username, menuOptions = defaultMenuOptions, onMenuSelect, size = 'md' }, ref) => {
        const { isMounted, animationClass, toggleDropdown } = useDropdownAnimation();

        useEffect(() => {
            toggleDropdown(isOpen);
        }, [isOpen, toggleDropdown]);

        if (!isMounted) return null;

        return (
            <div ref={ref} className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${animationClass}`}>
                <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{username || '-'}</p>
                    <p className="text-xs text-blue-600 mt-1">{userRole || 'User'}</p>
                </div>
                <div className="py-2">
                    {menuOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onMenuSelect(option.value)}
                            className={cn(
                                'block w-full text-left px-4 py-2 text-sm transition-colors',
                                option.type === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
);

ProfileDropdown.displayName = 'ProfileDropdown';