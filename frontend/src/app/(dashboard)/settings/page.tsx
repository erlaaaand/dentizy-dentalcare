"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Shield,
  Stethoscope,
  ChevronRight,
  Settings as SettingsIcon,
  Loader2,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardBody } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { useAuth } from "@/core/hooks/auth/useAuth";
import { ROLES } from "@/core/constants/role.constants";

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const userRoles = user?.roles?.map((role: any) => role.name) || [];

  // Akses Khusus Kepala Klinik
  const isKepalaKlinik = userRoles.includes(ROLES.KEPALA_KLINIK);

  if (authLoading) {
    return (
      <PageContainer title="Pengaturan">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageContainer>
    );
  }

  if (!isKepalaKlinik) {
    return (
      <PageContainer title="Akses Ditolak">
        <Card>
          <CardBody className="p-12 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600 mb-6">
              Halaman pengaturan hanya dapat diakses oleh Kepala Klinik.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Kembali ke Dashboard
            </button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  // Hanya menyisakan 3 Menu Utama
  const settingsMenu: SettingCardProps[] = [
    {
      title: "Status Sistem",
      description: "Monitor kesehatan server, database, dan performa API.",
      icon: Activity,
      href: "/settings/system-status", // File ini sudah Anda miliki
      badge: "Live",
      badgeVariant: "success",
    },
    {
      title: "Profil Klinik",
      description: "Atur nama klinik, alamat, dan logo untuk Invoice tagihan.",
      icon: Stethoscope,
      href: "/settings/clinic",
    },
    {
      title: "Keamanan Sistem",
      description: "Audit log akses pengguna dan kebijakan password.",
      icon: Shield,
      href: "/settings/security",
    },
  ];

  return (
    <PageContainer
      title="Pengaturan"
      subtitle="Konfigurasi sistem dan operasional klinik."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.href}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => router.push(item.href)}
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  {item.badge && (
                    <Badge variant={item.badgeVariant as any} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {item.title}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </h3>

                <p className="text-sm text-gray-500">{item.description}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Info Tambahan */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
        <SettingsIcon className="w-5 h-5 text-gray-400" />
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Versi Aplikasi:</span> v1.0.0 (Stable)
          &bull;
          <span className="ml-2 font-semibold">Server:</span> Online
        </div>
      </div>
    </PageContainer>
  );
}
