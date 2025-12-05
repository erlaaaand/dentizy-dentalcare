'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRevenueReport } from '@/core/services/api/reports.api';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { subDays, format } from 'date-fns';

export default function FinancialReport() {
    // Default: 30 hari terakhir
    const [dateRange] = useState({
        startDate: subDays(new Date(), 30).toISOString(),
        endDate: new Date().toISOString()
    });

    const { data, isLoading } = useRevenueReport({ ...dateRange, groupBy: 'day' });
    const chartData = (data as any)?.data || [];

    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // Hitung Total Omzet
    const totalRevenue = chartData.reduce((acc: number, curr: any) => acc + Number(curr.total), 0);

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-medium opacity-90">Total Pendapatan (30 Hari)</p>
                                <h3 className="text-2xl font-bold">{formatRp(totalRevenue)}</h3>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                
                {/* Anda bisa menambahkan card lain seperti Rata-rata per hari, dll */}
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Grafik Pendapatan Harian</CardTitle>
                </CardHeader>
                <CardBody className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                tickFormatter={(val) => `${val / 1000}k`}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                formatter={(value: any) => formatRp(value)}
                                labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy')}
                            />
                            <Legend />
                            <Bar dataKey="total" name="Pendapatan" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}