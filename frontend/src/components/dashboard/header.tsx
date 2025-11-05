'use client'

import { useState, useEffect, useRef } from 'react'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: 'appointment' | 'payment' | 'reminder'
}

const notifications: Notification[] = [
    {
        id: '1',
        title: 'Janji temu baru',
        message: 'Sari Indah membuat janji temu untuk besok',
        time: '5 menit yang lalu',
        type: 'appointment'
    },
    {
        id: '2',
        title: 'Pembayaran diterima',
        message: 'Budi Santoso telah menyelesaikan pembayaran',
        time: '15 menit yang lalu',
        type: 'payment'
    },
    {
        id: '3',
        title: 'Pengingat stok',
        message: 'Stok anestesi hampir habis',
        time: '1 jam yang lalu',
        type: 'reminder'
    }
]

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)

    const notificationRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications)
        setShowProfileDropdown(false)
    }

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown)
        setShowNotifications(false)
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Close dropdowns on escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowNotifications(false)
                setShowProfileDropdown(false)
            }
        }

        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [])

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
                {/* Page Title */}
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Halo, dr. Erland!</h1>
                    <p className="text-gray-600 mt-1">Selamat datang kembali di dashboard Dentizy</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-4 flex-shrink-0">

                    {/* Notification Button */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={toggleNotifications}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                            aria-label="Notifikasi"
                            aria-expanded={showNotifications}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                    {notifications.length > 99 ? '99+' : notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Notification Panel */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in duration-200">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                            aria-label="Tutup notifikasi"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                                <p className="text-xs text-blue-600 mt-2">{notification.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            <p className="text-sm">Tidak ada notifikasi</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-200">
                                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                        Lihat Semua Notifikasi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={toggleProfileDropdown}
                            className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Menu profil"
                            aria-expanded={showProfileDropdown}
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">EA</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in duration-200">
                                <div className="p-4 border-b border-gray-200">
                                    <p className="text-sm font-medium text-gray-900">dr. Erland Agustian</p>
                                    <p className="text-xs text-gray-500">erland@dentizy.com</p>
                                </div>
                                <div className="py-2">
                                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                        Profil Saya
                                    </button>
                                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                        Pengaturan
                                    </button>
                                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                        Bantuan
                                    </button>
                                </div>
                                <div className="border-t border-gray-200">
                                    <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}