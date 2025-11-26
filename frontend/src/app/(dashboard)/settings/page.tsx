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
    // Panggil sebagai fungsi dengan config object
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
    const { user } = useAuth();

    // Get user roles as array
    const userRoles = user?.roles?.map((role: any) => role.name) || [];

    // Queries
    const { data: healthData } = useQuery({
        queryKey: ['system-health-overview'],
        queryFn: fetchHealthCheck,
        refetchInterval: 60000, // Refresh every minute
    });

    const { data: userStats } = useQuery({
        queryKey: ['user-statistics'],
        queryFn: fetchUserStats,
        enabled: userRoles.includes(ROLES.KEPALA_KLINIK),
    });

    const settingsMenu: SettingCardProps[] = [
        // Clinic Management
        {
            title: 'Kategori Layanan',
            description: 'Kelola kategori dan harga layanan',
            icon: FileText,
            href: '/settings/categories',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },

        // System & Monitoring
        {
            title: 'Status Sistem',
            description: 'Monitor kesehatan server dan database',
            icon: Activity,
            href: '/settings/system-status',
        },
        {
            title: 'Notifikasi',
            description: 'Kelola pengaturan notifikasi dan reminder',
            icon: Bell,
            href: '/settings/notifications',
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
            title="Pengaturan"
            subtitle="Kelola konfigurasi sistem dan preferensi Anda"
        >
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
                                    : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
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
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-between">
                                    {item.title}
                                    {!isDisabled && (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
                                            <Badge key={idx} variant="primary" size="sm">
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

            {/* Help Section */}
            <Card className="mt-6 border-blue-100 bg-blue-50">
                <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                                Butuh Bantuan?
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Hubungi administrator sistem jika Anda memerlukan bantuan atau mengalami masalah dengan pengaturan.
                            </p>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                Hubungi Support →
                            </button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </PageContainer>
    );
}