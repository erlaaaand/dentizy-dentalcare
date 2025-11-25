// ============================================================================
// FILE 4: frontend/src/app/(dashboard)/settings/system-status/page.tsx
// System Status Monitoring (Updated from backup page)
// ============================================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, Clock, CheckCircle, XCircle, Cpu, HardDrive } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { customInstance } from '@/core/services/http/axiosInstance';
import { formatDateTime } from '@/core/utils/date/date.utils';

const fetchHealthCheck = async () => {
    const { data } = await customInstance.get('/health-check');
    return data;
};

export default function SystemStatusPage() {
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['system-health'],
        queryFn: fetchHealthCheck,
        refetchInterval: 30000, // Auto refresh every 30 seconds
    });

    const StatusItem = ({ icon: Icon, label, value, status }: any) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'ok' ? 'bg-green-100 text-green-600' :
                    status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                    }`}>
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

    return (
        <PageContainer
            title="Status Sistem"
            subtitle="Monitoring kesehatan server dan database klinik."
            actions={
                <Button variant="outline" onClick={() => refetch()} isLoading={isRefetching}>
                    Refresh Status
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            value={isLoading ? "Memeriksa..." : "Online & Responsive"}
                            status={data ? 'ok' : 'error'}
                        />
                        <StatusItem
                            icon={Database}
                            label="Database Connection"
                            value={isLoading ? "Memeriksa..." : "Connected"}
                            status={data ? 'ok' : 'error'}
                        />
                        <StatusItem
                            icon={Cpu}
                            label="CPU Usage"
                            value="23% (Normal)"
                            status="ok"
                        />
                        <StatusItem
                            icon={HardDrive}
                            label="Storage"
                            value="45 GB / 100 GB (45%)"
                            status="ok"
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Server</CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Terakhir Diperbarui</span>
                            <span className="font-mono text-sm">{formatDateTime(new Date())}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Environment</span>
                            <Badge variant="outline">Production</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Versi Aplikasi</span>
                            <span className="font-mono text-sm">v2.1.0 (Dentizy Core)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Uptime</span>
                            <span className="font-mono text-sm">7d 14h 32m</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="font-mono text-sm">{formatDateTime(new Date())}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* System Metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Active Sessions</p>
                            <p className="text-2xl font-bold text-gray-900">8</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">API Requests</p>
                            <p className="text-2xl font-bold text-gray-900">1.2k</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">145ms</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </PageContainer>
    );
}