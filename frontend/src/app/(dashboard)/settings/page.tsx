// ============================================================================
// FILE: frontend/src/app/(dashboard)/settings/page.tsx
// Settings Main Page - Complete with All Features
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import {
    Users,
    Stethoscope,
    Database,
    Bell,
    Shield,
    Settings as SettingsIcon,
    ChevronRight,
    UserCog,
    Activity,
    Globe,
    FileText,
    CreditCard,
    CheckCircle,
    Clock,
    TrendingUp
} from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { useAuth } from '@/core/hooks/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@/core/services/http/axiosInstance';
import { ROLES } from '@/core/constants/role.constants';
import { formatDateTime } from '@/core/utils/date/date.utils';

interface SettingCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
    badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    disabled?: boolean;
    requiresRole?: string[];
}

// Fetch system health
const fetchHealthCheck = async () => {
    const result = await customInstance({
        url: '/health',
        method: 'GET'
    });
    return result;
};

const fetchUserStats = async () => {
    const result = await customInstance({
        url: '/users/statistics',
        method: 'GET'
    });
    return result;
}

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Get user roles as array
    const userRoles = user?.roles?.map((role: any) => role.name) || [];

    // ✅ FIX: Check if user is kepala klinik
    const isKepalaKlinik = userRoles.includes(ROLES.KEPALA_KLINIK) ||
        userRoles.includes('kepala_klinik') ||
        userRoles.includes('head_clinic');

    // ✅ FIX: Pindahkan SEMUA hooks ke atas SEBELUM conditional returns
    const { data: healthData } = useQuery({
        queryKey: ['system-health-overview'],
        queryFn: fetchHealthCheck,
        refetchInterval: 60000,
        enabled: isKepalaKlinik && !authLoading, // ✅ Hanya fetch jika kepala klinik dan auth sudah loaded
    });

    const { data: userStats } = useQuery({
        queryKey: ['user-statistics'],
        queryFn: fetchUserStats,
        enabled: isKepalaKlinik && !authLoading, // ✅ Hanya fetch jika kepala klinik dan auth sudah loaded
    });

    // ✅ FIX: Show loading while checking authentication
    if (authLoading) {
        return (
            <PageContainer title="Pengaturan">
                <Card>
                    <CardBody className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SettingsIcon className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Memeriksa Akses...</h3>
                            <p className="text-gray-600">
                                Sedang memverifikasi hak akses Anda.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    // ✅ FIX: Show access denied if not kepala klinik - SETELAH semua hooks
    if (!isKepalaKlinik) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Akses Ditolak</h3>
                            <p className="text-gray-600">
                                Anda tidak memiliki akses ke halaman ini. Halaman ini hanya dapat diakses oleh Kepala Klinik.
                            </p>
                            <div className="mt-4">
                                <Badge variant="danger" size="sm">
                                    Role Anda: {userRoles.join(', ').replace(/_/g, ' ') || 'Tidak ada role'}
                                </Badge>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    // ✅ LANJUTKAN dengan kode utama JIKA kepala klinik
    const settingsMenu: SettingCardProps[] = [
        // User Management - hanya untuk kepala klinik
        {
            title: 'Manajemen Pengguna',
            description: 'Kelola akun pengguna dan peran akses',
            icon: Users,
            href: '/settings/users',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        {
            title: 'Manajemen Staf',
            description: 'Kelola data dokter dan staf klinik',
            icon: UserCog,
            href: '/settings/staff',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Clinic Settings - hanya untuk kepala klinik
        {
            title: 'Pengaturan Klinik',
            description: 'Konfigurasi informasi dan operasional klinik',
            icon: Stethoscope,
            href: '/settings/clinic',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Treatment & Services - hanya untuk kepala klinik
        {
            title: 'Layanan & Perawatan',
            description: 'Kelola kategori dan jenis perawatan',
            icon: Activity,
            href: '/settings/treatments',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Database Management - hanya untuk kepala klinik
        {
            title: 'Manajemen Database',
            description: 'Backup, restore, dan maintenance data',
            icon: Database,
            href: '/settings/database',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // System & Monitoring - hanya untuk kepala klinik
        {
            title: 'Status Sistem',
            description: 'Monitor kesehatan server dan database',
            icon: Activity,
            href: '/settings/system-status',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Notifications - hanya untuk kepala klinik
        {
            title: 'Notifikasi Sistem',
            description: 'Kelola pengaturan notifikasi dan alert',
            icon: Bell,
            href: '/settings/notifications',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Security - hanya untuk kepala klinik
        {
            title: 'Keamanan',
            description: 'Pengaturan keamanan dan audit log',
            icon: Shield,
            href: '/settings/security',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Billing & Payments - hanya untuk kepala klinik
        {
            title: 'Tagihan & Pembayaran',
            description: 'Konfigurasi sistem pembayaran dan invoice',
            icon: CreditCard,
            href: '/settings/billing',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // Reports - hanya untuk kepala klinik
        {
            title: 'Laporan & Analytics',
            description: 'Generate laporan dan analisis data',
            icon: TrendingUp,
            href: '/settings/reports',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        // General Settings - hanya untuk kepala klinik
        {
            title: 'Pengaturan Umum',
            description: 'Konfigurasi aplikasi dan preferensi',
            icon: SettingsIcon,
            href: '/settings/general',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
    ];

    const handleNavigate = (item: SettingCardProps) => {
        if (item.disabled) return;

        if (item.requiresRole && !hasAccess(item.requiresRole)) {
            return;
        }

        router.push(item.href);
    };

    const hasAccess = (requiredRoles: string[]) => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.some(role => userRoles.includes(role));
    };

    const isAccessible = (item: SettingCardProps) => {
        if (!item.requiresRole) return true;
        return hasAccess(item.requiresRole);
    };

    const getSystemStatus = () => {
        if (!healthData) return { text: 'Memeriksa...', color: 'text-gray-500', bg: 'bg-gray-50' };
        return { text: 'Online', color: 'text-green-600', bg: 'bg-green-50' };
    };

    const systemStatus = getSystemStatus();

    return (
        <PageContainer
            title="Pengaturan Sistem"
            subtitle="Kelola konfigurasi sistem dan operasional klinik - Hanya untuk Kepala Klinik"
        >
            {/* Access Badge */}
            <div className="mb-6">
                <Badge variant="success" size="lg">
                    ✅ Akses Kepala Klinik - Full System Access
                </Badge>
            </div>

            {/* Settings Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsMenu.map((item) => {
                    const Icon = item.icon;
                    const accessible = isAccessible(item);
                    const isDisabled = item.disabled || !accessible;

                    return (
                        <Card
                            key={item.href}
                            className={`
                                transition-all duration-200 
                                ${isDisabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer border-blue-200'
                                }
                            `}
                            onClick={() => handleNavigate(item)}
                        >
                            <CardBody className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`
                                        p-3 rounded-lg 
                                        ${isDisabled
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-blue-50 text-blue-600'
                                        }
                                    `}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    {item.badge && (
                                        <Badge
                                            variant={item.badgeVariant as any}
                                            size="sm"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                    {item.requiresRole && (
                                        <Badge variant="primary" size="sm">
                                            Kepala Klinik
                                        </Badge>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-between">
                                    {item.title}
                                    {!isDisabled && (
                                        <ChevronRight className="w-5 h-5 text-blue-500" />
                                    )}
                                </h3>

                                <p className="text-sm text-gray-500 mb-3">
                                    {item.description}
                                </p>

                                {!accessible && item.requiresRole && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <Badge variant="warning" size="sm">
                                            Khusus {item.requiresRole.join(', ').replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            {/* System Overview Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* System Status */}
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${systemStatus.bg}`}>
                                <Activity className={`w-6 h-6 ${systemStatus.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status Sistem</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className={`text-lg font-semibold ${systemStatus.color}`}>
                                        {systemStatus.text}
                                    </p>
                                    {!!healthData && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* User Role */}
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Role Anda</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {userRoles.length > 0 ? (
                                        userRoles.map((role, idx) => (
                                            <Badge
                                                key={idx}
                                                variant={role === ROLES.KEPALA_KLINIK ? "success" : "primary"}
                                                size="sm"
                                            >
                                                {role.replace(/_/g, ' ')}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">Tidak ada role</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* App Version */}
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <SettingsIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Versi Aplikasi</p>
                                <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
                                <p className="text-xs text-gray-400 mt-1">Dentizy Dentalcare</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Last Updated Info */}
            <Card className="mt-6 border-gray-200 bg-gray-50">
                <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Terakhir Diperbarui
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDateTime(new Date())}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" size="sm">
                            Auto-refresh 60s
                        </Badge>
                    </div>
                </CardBody>
            </Card>

            {/* Admin Notice */}
            <Card className="mt-6 border-green-100 bg-green-50">
                <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                                Akses Administrator Sistem
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Sebagai Kepala Klinik, Anda memiliki akses penuh untuk mengelola semua aspek sistem.
                                Pastikan untuk melakukan perubahan dengan hati-hati.
                            </p>
                            <Badge variant="success" size="sm">
                                Hak Akses: Full System Administrator
                            </Badge>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </PageContainer>
    );
}