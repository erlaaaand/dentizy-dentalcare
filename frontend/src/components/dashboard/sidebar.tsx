'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/authService'

// ============================================
// TYPES
// ============================================
interface NavigationItem {
    id: string
    label: string
    href: string
    icon: React.ReactElement
    allowedRoles: string[]  // Roles yang boleh akses
    badge?:
    {
        text: string
        color: 'blue' | 'green' | 'yellow' | 'red'
    }
}

interface User {
    id: number
    username: string
    nama_lengkap: string
    roles: string[]
}

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
                <path fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd" />
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
                <path fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd" />
            </svg>
        )
    },
    {
        id: 'reports',
        label: 'Laporan',
        href: '/dashboard/reports',
        allowedRoles: ['kepala_klinik', 'dokter'], // Hanya kepala klinik dan dokter
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
        allowedRoles: ['kepala_klinik'], // Hanya kepala klinik
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
        allowedRoles: ['kepala_klinik'], // Hanya kepala klinik
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd" />
            </svg>
        )
    }
]

// ============================================
// ROLE BADGE COMPONENT
// ============================================
function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; color: string }> = {
        kepala_klinik: { label: 'Kepala Klinik', color: 'bg-purple-500' },
        dokter: { label: 'Dokter', color: 'bg-blue-500' },
        staf: { label: 'Staf', color: 'bg-green-500' }
    }

    const config = roleConfig[role] || { label: role, color: 'bg-gray-500' }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${config.color}`}>
            {config.label}
        </span>
    )
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
export default function Sidebar() {
    const [isMinimized, setIsMinimized] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const pathname = usePathname()

    // Load user data
    useEffect(() => {
        const user = getCurrentUser()
        if (user) {
            setCurrentUser(user)
        }
    }, [])

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized)
    }

    // Check if user has access to route
    const hasAccess = (allowedRoles: string[]): boolean => {
        if (!currentUser?.roles) return false
        return currentUser.roles.some(role => allowedRoles.includes(role))
    }

    // Filter navigation items based on user roles
    const filteredNavigation = navigationItems.filter(item => hasAccess(item.allowedRoles))

    // Check if route is active
    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    // Get badge color classes
    const getBadgeColor = (color: string) => {
        const colors = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500'
        }
        return colors[color as keyof typeof colors] || colors.blue
    }

    // Get user's primary role for display
    const getPrimaryRole = () => {
        if (!currentUser?.roles || currentUser.roles.length === 0) return 'User'
        
        // Priority: kepala_klinik > dokter > staf
        if (currentUser.roles.includes('kepala_klinik')) return 'kepala_klinik'
        if (currentUser.roles.includes('dokter')) return 'dokter'
        if (currentUser.roles.includes('staf')) return 'staf'
        
        return currentUser.roles[0]
    }

    return (
        <aside className={`bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col relative ${isMinimized ? 'w-16' : 'w-64'}`}>
            {/* Sidebar Header */}
            <header className="border-b border-gray-700 p-4">
                {isMinimized ? (
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                        title="Expand sidebar"
                    >
                        <svg className="w-8 h-8 text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                            <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                            <div className="transition-all duration-300 ease-in-out">
                                <h1 className="text-xl font-bold">Dentizy</h1>
                                <p className="text-sm text-gray-300">Dentalcare</p>
                            </div>
                        </div>

                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                            title="Minimize sidebar"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </header>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {filteredNavigation.map((item) => {
                        const isActive = isActiveRoute(item.href)

                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg transition-colors relative group ${
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-700'
                                    } ${isMinimized ? 'justify-center' : 'space-x-3'}`}
                                >
                                    {item.icon}
                                    
                                    {!isMinimized && (
                                        <>
                                            <span className="transition-all duration-300 ease-in-out flex-1">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getBadgeColor(item.badge.color)}`}>
                                                    {item.badge.text}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    
                                    {isMinimized && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Sidebar Footer */}
            <footer className="border-t border-gray-700 p-4">
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'space-x-3'}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">
                            {currentUser?.nama_lengkap?.substring(0, 2).toUpperCase() || '?'}
                        </span>
                    </div>
                    {!isMinimized && (
                        <div className="transition-all duration-300 ease-in-out min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                                {currentUser?.nama_lengkap || 'User'}
                            </p>
                            <div className="mt-1">
                                <RoleBadge role={getPrimaryRole()} />
                            </div>
                        </div>
                    )}
                </div>
            </footer>
        </aside>
    )
}