'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core';
import { Avatar } from '@/components/ui';
import type { Role } from './sidebar.types';
import { navigationItems } from './sidebar.config';
import {
    NavItem,
    RoleBadge,
    SidebarSkeleton,
    EmptyNavigation,
    SidebarHeader
} from './SidebarComponents';
import { cn } from '@/core';

export default function Sidebar() {
    const [isMinimized, setIsMinimized] = useState(false);
    const { user: currentUser, loading } = useAuth();
    const pathname = usePathname();

    const hasAccess = (allowedRoles: string[]): boolean => {
        if (!currentUser?.roles || !Array.isArray(currentUser.roles)) return false;

        return currentUser.roles.some((role: string | Role) => {
            const roleName = typeof role === 'string' ? role : role.name;
            return allowedRoles.includes(roleName);
        });
    };

    const filteredNavigation = navigationItems.filter((item) =>
        hasAccess(item.allowedRoles)
    );

    const isActiveRoute = (href: string): boolean => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const getPrimaryRole = (): string => {
        if (!currentUser?.roles?.length) return 'User';

        const roleNames = currentUser.roles.map((role: string | Role) =>
            typeof role === 'string' ? role : role.name
        );

        // Priority order
        if (roleNames.includes('kepala_klinik')) return 'kepala_klinik';
        if (roleNames.includes('dokter')) return 'dokter';
        if (roleNames.includes('staf')) return 'staf';

        return roleNames[0] || 'User';
    };

    return (
        <aside
            className={cn(
                'bg-gray-800 text-white transition-all duration-300 ease-in-out',
                'flex flex-col h-screen overflow-hidden',
                isMinimized ? 'w-16' : 'w-64'
            )}
        >
            <SidebarHeader
                isMinimized={isMinimized}
                onToggle={() => setIsMinimized(!isMinimized)}
            />

            <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
                {loading ? (
                    <SidebarSkeleton />
                ) : filteredNavigation.length === 0 ? (
                    <EmptyNavigation />
                ) : (
                    <ul className="space-y-2">
                        {filteredNavigation.map((item, index) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                isActive={isActiveRoute(item.href)}
                                isMinimized={isMinimized}
                                index={index}
                            />
                        ))}
                    </ul>
                )}
            </nav>

            <footer className="border-t border-gray-700 p-4 flex-shrink-0">
                {loading ? (
                    <div className={cn(
                        'flex items-center',
                        isMinimized ? 'justify-center' : 'space-x-3'
                    )}>
                        <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
                        {!isMinimized && (
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
                                <div className="h-3 bg-gray-700 rounded animate-pulse w-16" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        'flex items-center transition-all',
                        isMinimized ? 'justify-center' : 'space-x-3'
                    )}>
                        <Avatar
                            name={(currentUser?.nama_lengkap as string || 'User')}
                            size="md"
                        />
                        {!isMinimized && (
                            <div className="min-w-0 flex-1 animate-fade-in">
                                <p className="text-sm font-medium truncate">
                                    {(currentUser?.nama_lengkap as string || 'User')}
                                </p>
                                <div className="mt-1">
                                    <RoleBadge role={getPrimaryRole()} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </footer>
        </aside>
    );
}