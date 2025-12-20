'use client';

import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { useTreatmentAnalytics } from '@/core/services/api/reports.api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Activity } from 'lucide-react';

export default function TreatmentAnalytics() {
    const { data, isLoading } = useTreatmentAnalytics({});
    const stats = (data as any)?.data || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0d3db', '#c4a0db'];
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>;

    if (stats.length === 0) {
        return (
            <Card>
                <CardBody className="p-8 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    Belum ada data layanan.
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table Detail */}
            <Card className="order-2 lg:order-1">
                <CardHeader>
                    <CardTitle>Top Layanan (Berdasarkan Jumlah)</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Nama Layanan</th>
                                    <th className="px-4 py-3 text-center">Jumlah</th>
                                    <th className="px-4 py-3 text-right">Kontribusi Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stats.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.treatmentName}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {item.usageCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 font-mono">
                                            {formatRp(Number(item.totalRevenue))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Pie Chart */}
            <Card className="order-1 lg:order-2">
                <CardHeader>
                    <CardTitle>Distribusi Layanan</CardTitle>
                </CardHeader>
                <CardBody className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="usageCount"
                                nameKey="treatmentName"
                                // [FIX] Tambahkan ': any' di sini untuk bypass error TypeScript
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                    return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '';
                                }}
                            >
                                {stats.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}