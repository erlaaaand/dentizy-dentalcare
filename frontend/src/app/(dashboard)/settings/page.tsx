
// ============================================================================
// FILE 1: frontend/src/app/(dashboard)/settings/page.tsx
// Settings Main Page with Navigation
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
    Palette,
    Globe,
    FileText,
    CreditCard
} from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { useAuth } from '@/core/hooks/auth/useAuth';
import { ROLES } from '@/core/constants/role.constants';

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

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Get user roles as array
    const userRoles = user?.roles?.map((role: any) => role.name) || [];

    const settingsMenu: SettingCardProps[] = [
        // User & Access Management
        {
            title: 'Manajemen Pengguna',
            description: 'Kelola akun dokter, staf, dan admin klinik',
            icon: Users,
            href: '/settings/users',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        {
            title: 'Profil Saya',
            description: 'Update informasi pribadi dan password',
            icon: UserCog,
            href: '/settings/profile',
        },

        // Clinic Management
        {
            title: 'Layanan & Tindakan',
            description: 'Atur daftar tindakan medis dan harga',
            icon: Stethoscope,
            href: '/settings/clinic',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        {
            title: 'Kategori Layanan',
            description: 'Kelola kategori dan klasifikasi tindakan',
            icon: FileText,
            href: '/settings/categories',
            requiresRole: [ROLES.KEPALA_KLINIK],
        },
        {
            title: 'Metode Pembayaran',
            description: 'Konfigurasi metode pembayaran yang tersedia',
            icon: CreditCard,
            href: '/settings/payment-methods',
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
            badge: 'Beta',
            badgeVariant: 'warning',
        },

        // Customization
        {
            title: 'Tampilan & Tema',
            description: 'Sesuaikan tampilan dan preferensi UI',
            icon: Palette,
            href: '/settings/appearance',
            badge: 'Segera',
            badgeVariant: 'default',
            disabled: true,
        },
        {
            title: 'Keamanan',
            description: 'Pengaturan keamanan dan privasi akun',
            icon: Shield,
            href: '/settings/security',
        },
        {
            title: 'Backup & Restore',
            description: 'Kelola backup data dan restore sistem',
            icon: Database,
            href: '/settings/backup',
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

    const getBadgeVariant = (variant?: string) => {
        switch (variant) {
            case 'primary': return 'primary';
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'danger': return 'danger';
            default: return 'default';
        }
    };

    return (
        <PageContainer
            title="Pengaturan"
            subtitle="Kelola konfigurasi sistem dan preferensi Anda"
        >
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
                                            // variant={getBadgeVariant(item.badgeVariant)}
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

            {/* Quick Stats Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Database className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status Sistem</p>
                                <p className="text-lg font-semibold text-gray-900">Aktif</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role Anda</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {userRoles.map((role, idx) => (
                                        <Badge key={idx} variant="primary" size="sm">
                                            {role.replace(/_/g, ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <SettingsIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Versi Aplikasi</p>
                                <p className="text-lg font-semibold text-gray-900">v2.1.0</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Help Section */}
            <Card className="mt-8 border-blue-100 bg-blue-50">
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
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                Hubungi Support →
                            </button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </PageContainer>
    );
}