'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
    id: string
    label: string
    href: string
    icon: React.ReactElement
}

const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
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
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
        )
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        href: '/dashboard/settings',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd" />
            </svg>
        )
    }
]

export default function Sidebar() {
    const [isMinimized, setIsMinimized] = useState(false)
    const pathname = usePathname()

    const toggleSidebar = () => {
        setIsMinimized(!isMinimized)
    }

    // Function to check if current path matches navigation item
    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <aside className={`bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col relative ${isMinimized ? 'w-16' : 'w-64'
            }`}>
            {/* Sidebar Header */}
            <header className="border-b border-gray-700 p-4">
                {isMinimized ? (
                    /* When minimized - Logo becomes toggle button */
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
                    /* When expanded - Full header with logo and toggle */
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                            {/* Logo SVG */}
                            <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                            <div className="transition-all duration-300 ease-in-out">
                                <h1 className="text-xl font-bold">Dentizy</h1>
                                <p className="text-sm text-gray-300">Dentalcare</p>
                            </div>
                        </div>

                        {/* Sidebar Toggle Button */}
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
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => {
                        const isActive = isActiveRoute(item.href)

                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg transition-colors relative group ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-700'
                                        } ${isMinimized ? 'justify-center' : 'space-x-3'}`}
                                >
                                    {item.icon}
                                    {!isMinimized && (
                                        <span className="transition-all duration-300 ease-in-out">
                                            {item.label}
                                        </span>
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
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">EA</span>
                    </div>
                    {!isMinimized && (
                        <div className="transition-all duration-300 ease-in-out min-w-0">
                            <p className="text-sm font-medium truncate">dr. Erland Agustian</p>
                            <p className="text-xs text-gray-400">Dokter</p>
                        </div>
                    )}
                </div>
            </footer>
        </aside>
    )
}