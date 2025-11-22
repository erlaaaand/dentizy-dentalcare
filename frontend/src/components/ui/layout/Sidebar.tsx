'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/core/hooks/auth/useAuth'
import { Badge } from '../data-display/badge/'
import Avatar from '../data-display/avatar/Avatar'
import { Role } from '@/core/types/api'

// ============================================
// TYPES
// ============================================
interface NavigationItem {
    id: string
    label: string
    href: string
    icon: React.ReactElement
    allowedRoles: string[]
    badge?: {
        text: string
        color: 'blue' | 'green' | 'yellow' | 'red'
    }
}

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info'
type NavBadgeColor = 'blue' | 'green' | 'yellow' | 'red'

// ============================================
// NAVIGATION CONFIGURATION
// ============================================
const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
        )
    },
    {
        id: 'appointments',
        label: 'Jadwal Janji Temu',
        href: '/dashboard/appointments',
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'patients',
        label: 'Manajemen Pasien',
        href: '/dashboard/patients',
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
        )
    },
    {
        id: 'medical-records',
        label: 'Rekam Medis',
        href: '/dashboard/medical-records',
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'reports',
        label: 'Laporan',
        href: '/dashboard/reports',
        allowedRoles: ['kepala_klinik', 'dokter'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
        )
    },
    {
        id: 'users',
        label: 'Manajemen User',
        href: '/dashboard/users',
        allowedRoles: ['kepala_klinik'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
        ),
        badge: {
            text: 'Admin',
            color: 'red'
        }
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        href: '/dashboard/settings',
        allowedRoles: ['kepala_klinik'],
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
        )
    }
]

// ============================================
// COLOR MAPPING
// ============================================
const colorToVariantMap: Record<NavBadgeColor, BadgeVariant> = {
    red: 'error',
    green: 'success',
    yellow: 'warning',
    blue: 'info'
}

// ============================================
// ROLE BADGE COMPONENT
// ============================================
function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        kepala_klinik: { label: 'Kepala Klinik', variant: 'default' },
        dokter: { label: 'Dokter', variant: 'info' },
        staf: { label: 'Staf', variant: 'success' }
    }

    const config = roleConfig[role] || { label: role, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
export default function Sidebar() {
    const [isMinimized, setIsMinimized] = useState(false)
    const { user: currentUser, loading } = useAuth()
    const pathname = usePathname()

    const toggleSidebar = () => setIsMinimized(!isMinimized)

    // Check if user has access to route
    const hasAccess = (allowedRoles: string[]): boolean => {
        if (!currentUser?.roles) return false
        return currentUser.roles.some(role => {
            const roleName = typeof role === 'string' ? role : role.name
            return allowedRoles.includes(roleName)
        })
    }

    // Filter navigation items based on user roles
    const filteredNavigation = navigationItems.filter(item => hasAccess(item.allowedRoles))

    // Check if route is active
    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard'
        return pathname.startsWith(href)
    }

    // Get user's primary role for display
    const getPrimaryRole = () => {
        if (!currentUser?.roles || currentUser.roles.length === 0) return 'User'

        const roleNames = currentUser.roles.map((role: string | Role) =>
            typeof role === 'string' ? role : role.name
        )

        if (roleNames.includes('kepala_klinik')) return 'kepala_klinik'
        if (roleNames.includes('dokter')) return 'dokter'
        if (roleNames.includes('staf')) return 'staf'

        return roleNames[0] || 'User'
    }

    return (
        <aside
            className={`bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col h-screen overflow-hidden ${isMinimized ? 'w-16' : 'w-64'
                }`}
        >
            {/* Sidebar Header */}
            <header className="border-b border-gray-700 p-4 flex-shrink-0">
                {isMinimized ? (
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                        title="Expand sidebar"
                        aria-label="Expand sidebar"
                    >
                        <svg
                            className="w-8 h-8 text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center justify-between animate-fade-in">
                        <div className="flex items-center space-x-3 min-w-0">
                            <svg
                                className="w-8 h-8 text-blue-400 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                            <div className="min-w-0">
                                <h1 className="text-xl font-bold truncate">Dentizy</h1>
                                <p className="text-sm text-gray-300 truncate">Dentalcare</p>
                            </div>
                        </div>

                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                            title="Minimize sidebar"
                            aria-label="Minimize sidebar"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </header>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
                {loading ? (
                    // Loading skeleton
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="h-12 bg-gray-700 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredNavigation.length === 0 ? (
                    // No navigation items
                    <div className="text-center text-gray-400 text-sm py-8">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p>Tidak ada menu tersedia</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {filteredNavigation.map((item, index) => {
                            const isActive = isActiveRoute(item.href)

                            return (
                                <li
                                    key={item.id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-lg transition-all hover-lift relative group ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'hover:bg-gray-700'
                                            } ${isMinimized ? 'justify-center' : 'space-x-3'}`}
                                    >
                                        <span className={isActive ? 'animate-pulse' : ''}>
                                            {item.icon}
                                        </span>

                                        {!isMinimized && (
                                            <>
                                                <span className="flex-1 truncate">
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <Badge
                                                        variant={colorToVariantMap[item.badge.color]}
                                                        className="flex-shrink-0"
                                                    >
                                                        {item.badge.text}
                                                    </Badge>
                                                )}
                                            </>
                                        )}

                                        {isMinimized && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 animate-scale-in">
                                                {item.label}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </nav>

            {/* Sidebar Footer */}
            <footer className="border-t border-gray-700 p-4 flex-shrink-0">
                {loading ? (
                    // Loading skeleton for footer
                    <div className={`flex items-center ${isMinimized ? 'justify-center' : 'space-x-3'}`}>
                        <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
                        {!isMinimized && (
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
                                <div className="h-3 bg-gray-700 rounded animate-pulse w-16" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`flex items-center transition-all ${isMinimized ? 'justify-center' : 'space-x-3'}`}>
                        <div className="flex-shrink-0">
                            <Avatar
                                name={currentUser?.nama_lengkap || 'User'}
                                size="md"
                            />
                        </div>
                        {!isMinimized && (
                            <div className="min-w-0 flex-1 animate-fade-in">
                                <p className="text-sm font-medium truncate">
                                    {currentUser?.nama_lengkap || 'User'}
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
    )
}