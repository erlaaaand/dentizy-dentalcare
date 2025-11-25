'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { customInstance } from '@/core/services/http/axiosInstance';
import { formatDateTime } from '@/core/utils/date/date.utils';

// Fetcher khusus untuk health check karena biasanya tidak di-generate oleh generator biasa
const fetchHealthCheck = async () => {
    const { data } = await customInstance.get('/health-check');
    return data;
};

export default function SystemStatusPage() {
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['system-health'],
        queryFn: fetchHealthCheck,
        refetchInterval: 30000, // Auto refresh setiap 30 detik
    });

    const StatusItem = ({ icon: Icon, label, value, status }: any) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'ok' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{value}</p>
                </div>
            </div>
            {status === 'ok' ?
                <CheckCircle className="w-5 h-5 text-green-500" /> :
                <XCircle className="w-5 h-5 text-red-500" />
            }
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
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Server</CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Terakhir Diperbarui</span>
                            <span className="font-mono">{formatDateTime(new Date())}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Environment</span>
                            <Badge variant="outline">Production</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Versi Aplikasi</span>
                            <span className="font-mono">v1.0.0 (Dentizy Core)</span>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </PageContainer>
    );
}