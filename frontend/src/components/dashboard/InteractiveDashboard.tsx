'use client'

import React, { useState, useEffect } from 'react'

interface StatCard {
    title: string
    value: string | number
    subtitle: string
    color: 'blue' | 'green' | 'yellow' | 'purple'
    icon: React.JSX.Element
}

interface ScheduleItem {
    id: string
    time: string
    patient: {
        name: string
        phone: string
        initials: string
        avatar: string
    }
    treatment: string
    status: 'completed' | 'waiting' | 'cancelled' | 'scheduled'
}

interface QueueItem {
    id: string
    number: number
    name: string
    treatment: string
    estimatedTime: string
    status: 'serving' | 'waiting'
}

interface Activity {
    id: string
    title: string
    description: string
    time: string
    type: 'success' | 'info' | 'warning' | 'error'
}

const statsData: StatCard[] = [
    {
        title: 'Pasien Hari Ini',
        value: 12,
        subtitle: '+2 dari kemarin',
        color: 'blue',
        icon: (
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
        )
    },
    {
        title: 'Janji Temu Terkonfirmasi',
        value: 8,
        subtitle: '4 tersisa hari ini',
        color: 'green',
        icon: (
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd" />
            </svg>
        )
    },
    {
        title: 'Pasien Baru',
        value: 3,
        subtitle: 'Minggu ini',
        color: 'yellow',
        icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd" />
            </svg>
        )
    },
    {
        title: 'Total Pasien',
        value: 450,
        subtitle: 'Aktif',
        color: 'purple',
        icon: (
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
        )
    }
]

const scheduleData: ScheduleItem[] = [
    {
        id: '1',
        time: '09:00',
        patient: {
            name: 'Sari Indah',
            phone: '0812-3456-7890',
            initials: 'SI',
            avatar: 'pink'
        },
        treatment: 'Pembersihan Karang Gigi',
        status: 'completed'
    },
    {
        id: '2',
        time: '10:30',
        patient: {
            name: 'Budi Santoso',
            phone: '0821-9876-5432',
            initials: 'BS',
            avatar: 'green'
        },
        treatment: 'Tambal Gigi',
        status: 'waiting'
    },
    {
        id: '3',
        time: '14:00',
        patient: {
            name: 'Maya Putri',
            phone: '0856-1234-5678',
            initials: 'MP',
            avatar: 'purple'
        },
        treatment: 'Konsultasi Ortodonti',
        status: 'cancelled'
    },
    {
        id: '4',
        time: '15:30',
        patient: {
            name: 'Rina Permata',
            phone: '0877-2468-1357',
            initials: 'RP',
            avatar: 'indigo'
        },
        treatment: 'Perawatan Saluran Akar',
        status: 'scheduled'
    }
]

const queueData: QueueItem[] = [
    {
        id: '1',
        number: 1,
        name: 'Ahmad Fauzi',
        treatment: 'Sedang dilayani',
        estimatedTime: '',
        status: 'serving'
    },
    {
        id: '2',
        number: 2,
        name: 'Linda Sari',
        treatment: 'Scaling',
        estimatedTime: 'Est. 30 mnt',
        status: 'waiting'
    },
    {
        id: '3',
        number: 3,
        name: 'Rizki Pratama',
        treatment: 'Cabut Gigi',
        estimatedTime: 'Est. 45 mnt',
        status: 'waiting'
    },
    {
        id: '4',
        number: 4,
        name: 'Dewi Lestari',
        treatment: 'Konsultasi',
        estimatedTime: 'Est. 20 mnt',
        status: 'waiting'
    }
]

const activitiesData: Activity[] = [
    {
        id: '1',
        title: 'Perawatan selesai untuk Sari Indah',
        description: 'Pembersihan karang gigi berhasil diselesaikan',
        time: '2 menit yang lalu',
        type: 'success'
    },
    {
        id: '2',
        title: 'Pasien baru terdaftar',
        description: 'Dewi Lestari bergabung sebagai pasien baru',
        time: '15 menit yang lalu',
        type: 'info'
    },
    {
        id: '3',
        title: 'Pembayaran diterima',
        description: 'Budi Santoso menyelesaikan pembayaran Rp 150.000',
        time: '30 menit yang lalu',
        type: 'warning'
    },
    {
        id: '4',
        title: 'Janji temu dibatalkan',
        description: 'Maya Putri membatalkan janji temu ortodonti',
        time: '1 jam yang lalu',
        type: 'error'
    }
]

export default function InteractiveDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(timer)
    }, [])

    const getStatusBadge = (status: string) => {
        const statusMap = {
            completed: 'bg-green-100 text-green-800',
            waiting: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            scheduled: 'bg-blue-100 text-blue-800'
        }

        const statusText = {
            completed: 'Selesai',
            waiting: 'Menunggu',
            cancelled: 'Dibatalkan',
            scheduled: 'Terjadwal'
        }

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusMap[status as keyof typeof statusMap]}`}>
                {statusText[status as keyof typeof statusText]}
            </span>
        )
    }

    const getActivityDot = (type: string) => {
        const colorMap = {
            success: 'bg-green-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        }

        return <div className={`w-2 h-2 ${colorMap[type as keyof typeof colorMap]} rounded-full mt-2 flex-shrink-0`} />
    }

    return (
        <div className="space-y-8">
            {/* Statistics Cards Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <article
                        key={index}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => console.log(`Clicked ${stat.title}`)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                <p className="text-sm text-green-600 mt-1">{stat.subtitle}</p>
                            </div>
                            <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                                {stat.icon}
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule Table Section */}
                <section className="lg:col-span-2">
                    <article className="bg-white rounded-lg shadow">
                        {/* Section Header */}
                        <header className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Jadwal Hari Ini</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Lihat Semua
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Minggu, 31 Agustus 2025</p>
                        </header>

                        {/* Schedule Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jam
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Pasien
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Perawatan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {scheduleData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 bg-${item.patient.avatar}-500 rounded-full flex items-center justify-center mr-3`}>
                                                        <span className="text-xs font-medium text-white">{item.patient.initials}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.patient.name}</p>
                                                        <p className="text-xs text-gray-500">{item.patient.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.treatment}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {item.status === 'completed' && (
                                                    <button className="text-blue-600 hover:text-blue-900">Lihat Detail</button>
                                                )}
                                                {item.status === 'waiting' && (
                                                    <button className="text-blue-600 hover:text-blue-900">Mulai</button>
                                                )}
                                                {item.status === 'scheduled' && (
                                                    <button className="text-blue-600 hover:text-blue-900">Konfirmasi</button>
                                                )}
                                                {item.status === 'cancelled' && (
                                                    <button className="text-gray-400 cursor-not-allowed">-</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>

                {/* Queue Section */}
                <section className="lg:col-span-1">
                    <article className="bg-white rounded-lg shadow h-fit">
                        {/* Queue Header */}
                        <header className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Antrian Klinik</h2>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {queueData.filter(q => q.status === 'waiting').length} Menunggu
                                </span>
                            </div>
                        </header>

                        {/* Queue List */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {queueData.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${item.status === 'serving'
                                                ? 'bg-green-50 border-l-4 border-green-500'
                                                : 'bg-gray-50 border'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${item.status === 'serving'
                                                    ? 'bg-green-500 text-white animate-pulse'
                                                    : 'bg-gray-500 text-white'
                                                }`}>
                                                {item.status === 'serving' ? (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    item.number
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.treatment} {item.estimatedTime && `• ${item.estimatedTime}`}
                                                </p>
                                            </div>
                                        </div>
                                        {item.status === 'serving' ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Aktif</span>
                                        ) : (
                                            <button className="text-xs text-blue-600 hover:text-blue-800">Panggil</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Queue Actions */}
                            <footer className="mt-6 pt-4 border-t border-gray-200 flex space-x-2">
                                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    Tambah Antrian
                                </button>
                                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                                    Kelola Antrian
                                </button>
                            </footer>
                        </div>
                    </article>
                </section>
            </div>

            {/* Quick Actions Section */}
            <section>
                <header className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Aksi Cepat</h2>
                    <p className="text-sm text-gray-600 mt-1">Shortcut untuk tugas harian</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: 'Pasien Baru',
                            subtitle: 'Daftarkan pasien',
                            color: 'blue',
                            icon: (
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clipRule="evenodd" />
                                </svg>
                            )
                        },
                        {
                            title: 'Buat Janji',
                            subtitle: 'Jadwalkan temu',
                            color: 'green',
                            icon: (
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd" />
                                </svg>
                            )
                        },
                        {
                            title: 'Rekam Medis',
                            subtitle: 'Buat catatan',
                            color: 'purple',
                            icon: (
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                        clipRule="evenodd" />
                                </svg>
                            )
                        },
                        {
                            title: 'Inventori',
                            subtitle: 'Kelola stok',
                            color: 'yellow',
                            icon: (
                                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                    <path fillRule="evenodd"
                                        d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                        clipRule="evenodd" />
                                </svg>
                            )
                        }
                    ].map((action, index) => (
                        <button
                            key={index}
                            className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-${action.color}-500 transform hover:-translate-y-1`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                                    {action.icon}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">{action.title}</p>
                                    <p className="text-xs text-gray-500">{action.subtitle}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Recent Activities Section */}
            <section>
                <header className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Aktivitas Terbaru</h2>
                </header>

                <article className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="space-y-4">
                            {activitiesData.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg"
                                >
                                    {getActivityDot(activity.type)}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Activities Footer */}
                        <footer className="mt-6 pt-4 border-t border-gray-200">
                            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Lihat Riwayat Lengkap
                            </button>
                        </footer>
                    </div>
                </article>
            </section>
        </div>
    )
}