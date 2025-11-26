'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, Clock, CheckCircle, XCircle, HeartPulse } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { LoadingSpinner } from '@/components';
import { customInstance } from '@/core/services/http/axiosInstance';

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
        api: { status: string; responseTime: string };
        database: { status: string; message: string; responseTime: string };
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

type FullHealthResponse = {
    health: HealthResponse;
    details: HealthDetailsResponse;
    live: HealthLiveResponse;
    ready: HealthReadyResponse;
};

// ====================== FETCH HEALTH =====================
const fetchHealth = async (): Promise<FullHealthResponse> => {
    const [health, details, live, ready] = await Promise.all([
        customInstance<HealthResponse>({ url: '/health', method: 'GET' }),
        customInstance<HealthDetailsResponse>({ url: '/health/details', method: 'GET' }),
        customInstance<HealthLiveResponse>({ url: '/health/live', method: 'GET' }),
        customInstance<HealthReadyResponse>({ url: '/health/ready', method: 'GET' }),
    ]);

    // Jika customInstance langsung return response.data (umum di project Next.js)
    return { health, details, live, ready };
};

// ==================== COMPONENT PAGE =====================
export default function SystemStatusPage() {

    // HOOK query hanya boleh dipanggil DI DALAM komponen
    const { data, isLoading, refetch, isRefetching } =
        useQuery<FullHealthResponse>({
            queryKey: ['system-health'],
            queryFn: fetchHealth,
            refetchInterval: 30000,
        });

    // ====================== LOADING ======================
    if (isLoading || !data) {
        return (
            <PageContainer title="Status Sistem" subtitle="Memuat data...">
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" showText text="Memuat status..." center />
                </div>
            </PageContainer>
        );
    }

    const { health, details, live, ready } = data;

    // ===================== COMPONENT =====================
    const StatusItem = ({ icon: Icon, label, value, status }: any) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <div
                    className={`p-2 rounded-full ${status === 'ok'
                        ? 'bg-green-100 text-green-600'
                        : status === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                >
                    <Icon className="w-5 h-5" />
                </div>

                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{value}</p>
                </div>
            </div>

            {status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
            ) : status === 'warning' ? (
                <Clock className="w-5 h-5 text-yellow-500" />
            ) : (
                <XCircle className="w-5 h-5 text-red-500" />
            )}
        </div>
    );

    // ========================= UI =========================
    return (
        <PageContainer
            title="Status Sistem"
            subtitle="Monitoring kesehatan server dan database klinik."
            actions={[
                {
                    label: "Refresh Status",
                    onClick: () => refetch(),
                    variant: "outline",
                    loading: isRefetching,
                    icon: isRefetching ? <LoadingSpinner.Button /> : undefined
                }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ======================== HEALTH SECTION ======================== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Kesehatan Sistem
                        </CardTitle>
                    </CardHeader>

                    <CardBody className="space-y-4">

                        <StatusItem
                            icon={Server}
                            label="API Server"
                            value={health.status}
                            status={health.status === 'ok' ? 'ok' : 'error'}
                        />

                        <StatusItem
                            icon={Database}
                            label="Database"
                            value={details.checks.database.message}
                            status={details.checks.database.status === 'up' ? 'ok' : 'error'}
                        />

                        <StatusItem
                            icon={HeartPulse}
                            label="Live Status"
                            value={live.status}
                            status={live.status === 'alive' ? 'ok' : 'error'}
                        />

                        <StatusItem
                            icon={CheckCircle}
                            label="Ready Status"
                            value={ready.status}
                            status={ready.status === 'ready' ? 'ok' : 'error'}
                        />
                    </CardBody>
                </Card>

                {/* ===================== SERVER INFORMATION ===================== */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Server</CardTitle>
                    </CardHeader>

                    <CardBody className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Environment</span>
                            <Badge variant="outline">{health.environment}</Badge>
                        </div>

                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Node Version</span>
                            <span className="font-mono text-sm">{details.system.nodeVersion}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">Uptime</span>
                            <span className="font-mono text-sm">{details.system.uptime}</span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Memory Usage</span>
                            <span className="font-mono text-sm">
                                {details.system.memory.used} / {details.system.memory.total}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* OPTIONAL METRICS */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardBody><div className="text-center"><p className="text-sm text-gray-500 mb-1">Total Users</p><p className="text-2xl font-bold">24</p></div></CardBody></Card>
                <Card><CardBody><div className="text-center"><p className="text-sm text-gray-500 mb-1">Active Sessions</p><p className="text-2xl font-bold">8</p></div></CardBody></Card>
                <Card><CardBody><div className="text-center"><p className="text-sm text-gray-500 mb-1">API Requests</p><p className="text-2xl font-bold">1.2k</p></div></CardBody></Card>
                <Card><CardBody><div className="text-center"><p className="text-sm text-gray-500 mb-1">Response Time</p><p className="text-2xl font-bold">145ms</p></div></CardBody></Card>
            </div>
        </PageContainer>
    );
}
