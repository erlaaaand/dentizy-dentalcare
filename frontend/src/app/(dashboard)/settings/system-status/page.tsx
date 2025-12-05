"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Database,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  HeartPulse,
  Users,
  Zap,
  BarChart2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { LoadingSpinner } from "@/components";
import { customInstance } from "@/core/services/http/axiosInstance";

// ====================== TYPES ============================
type HealthResponse = {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
};

type HealthDetailsResponse = {
  status: string;
  timestamp: string;
  checks: {
    api: { status: string; responseTime: string }; // e.g "14ms"
    database: { status: string; message: string; responseTime: string }; // e.g "5ms"
  };
  system: {
    uptime: string;
    environment: string;
    nodeVersion: string;
    memory: {
      used: string;
      total: string;
    };
  };
};

type HealthLiveResponse = {
  status: string;
  timestamp: string;
};

type HealthReadyResponse = {
  status: string;
  timestamp: string;
};

type UserStatisticsResponse = {
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
};

type DashboardData = {
  health: HealthResponse;
  details: HealthDetailsResponse;
  live: HealthLiveResponse;
  ready: HealthReadyResponse;
  userStats: UserStatisticsResponse;
};

// ====================== FETCH DATA =====================
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Fetch semua endpoint secara paralel agar cepat
  const [health, details, live, ready, userStats] = await Promise.all([
    customInstance<HealthResponse>({ url: "/health", method: "GET" }),
    customInstance<HealthDetailsResponse>({
      url: "/health/details",
      method: "GET",
    }),
    customInstance<HealthLiveResponse>({ url: "/health/live", method: "GET" }),
    customInstance<HealthReadyResponse>({
      url: "/health/ready",
      method: "GET",
    }),
    // Mengambil statistik user real dari backend
    customInstance<UserStatisticsResponse>({
      url: "/users/statistics",
      method: "GET",
    }),
  ]);

  return { health, details, live, ready, userStats };
};

// ==================== COMPONENT PAGE =====================
export default function SystemStatusPage() {
  const { data, isLoading, refetch, isRefetching } = useQuery<DashboardData>({
    queryKey: ["system-status-dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Auto-refresh setiap 30 detik
  });

  // ====================== LOADING ======================
  if (isLoading || !data) {
    return (
      <PageContainer title="Status Sistem" subtitle="Memuat data...">
        <div className="flex justify-center py-20">
          <LoadingSpinner
            size="lg"
            showText
            text="Mengambil data server..."
            center
          />
        </div>
      </PageContainer>
    );
  }

  const { health, details, live, ready, userStats } = data;

  // ===================== COMPONENT HELPER =====================
  const StatusItem = ({ icon: Icon, label, value, status }: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            status === "ok"
              ? "bg-green-100 text-green-600"
              : status === "warning"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {status === "ok" ? "Operational" : "Issue Detected"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <span
          className={`font-mono font-bold ${
            status === "ok" ? "text-gray-700" : "text-red-600"
          }`}
        >
          {value}
        </span>
        {status === "ok" ? (
          <CheckCircle className="w-4 h-4 text-green-500 inline-block ml-2" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 inline-block ml-2" />
        )}
      </div>
    </div>
  );

  // ========================= UI =========================
  return (
    <PageContainer
      title="Status Sistem"
      subtitle="Monitoring real-time infrastruktur dan performa aplikasi."
      actions={[
        {
          label: isRefetching ? "Memperbarui..." : "Segarkan Data",
          onClick: () => refetch(),
          variant: "outline",
          loading: isRefetching,
          icon: isRefetching ? <LoadingSpinner.Button /> : undefined,
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ======================== HEALTH CHECK ======================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Kesehatan Layanan
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-4">
            <StatusItem
              icon={Server}
              label="API Gateway"
              value={health.status.toUpperCase()}
              status={health.status === "ok" ? "ok" : "error"}
            />

            <StatusItem
              icon={Database}
              label="Database Connection"
              value={details.checks.database.status.toUpperCase()}
              status={details.checks.database.status === "up" ? "ok" : "error"}
            />

            <StatusItem
              icon={HeartPulse}
              label="Liveness Probe"
              value={live.status.toUpperCase()}
              status={live.status === "alive" ? "ok" : "error"}
            />

            <StatusItem
              icon={CheckCircle}
              label="Readiness Probe"
              value={ready.status.toUpperCase()}
              status={ready.status === "ready" ? "ok" : "error"}
            />
          </CardBody>
        </Card>

        {/* ===================== SERVER SPECS ===================== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              Informasi Server
            </CardTitle>
          </CardHeader>

          <CardBody className="space-y-0 divide-y">
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 text-sm">Environment</span>
              <Badge variant="outline" className="font-mono">
                {health.environment || "Production"}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 text-sm">Node.js Version</span>
              <span className="font-mono text-sm font-medium text-gray-900">
                {details.system.nodeVersion}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 text-sm">System Uptime</span>
              <span className="font-mono text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                {details.system.uptime}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 text-sm">Memory Usage</span>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-gray-900">
                  {details.system.memory.used}
                </span>
                <span className="text-xs text-gray-400 mx-1">/</span>
                <span className="font-mono text-sm text-gray-500">
                  {details.system.memory.total}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* =================== METRICS (REAL DATA) =================== */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users Real */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Total Pengguna
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.total}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Akun terdaftar dalam sistem
            </p>
          </CardBody>
        </Card>

        {/* Metric 2: Active Users Real */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Akun Aktif</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.active}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pengguna status 'active'
            </p>
          </CardBody>
        </Card>

        {/* Metric 3: Database Latency Real */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">DB Latency</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {details.checks.database.responseTime}
            </p>
            <p className="text-xs text-gray-400 mt-1">Waktu respon database</p>
          </CardBody>
        </Card>

        {/* Metric 4: API Latency Real */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">API Latency</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {details.checks.api.responseTime}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Waktu respon internal API
            </p>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
