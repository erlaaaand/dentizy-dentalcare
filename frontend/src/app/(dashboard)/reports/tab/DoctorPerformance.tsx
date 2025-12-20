'use client';

import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { useDoctorPerformance } from '@/core/services/api/reports.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, User } from 'lucide-react';

export default function DoctorPerformance() {
    const { data, isLoading } = useDoctorPerformance({});
    const stats = (data as any)?.data || [];

    // Warna-warni untuk chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8"/></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Produktivitas Dokter</CardTitle>
                </CardHeader>
                <CardBody className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="doctorName" width={100} style={{ fontSize: '12px' }} />
                            <Tooltip />
                            <Bar dataKey="totalPatients" name="Total Pasien" radius={[0, 4, 4, 0]} barSize={30}>
                                {stats.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>

            {/* Leaderboard Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Peringkat Dokter</CardTitle>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {stats.map((doc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{doc.doctorName}</p>
                                        <p className="text-xs text-gray-500">Dokter Gigi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600">{doc.totalPatients}</p>
                                    <p className="text-[10px] text-gray-400">Pasien</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}