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

    const { data, isLoading, error } = useRevenueReport({ ...dateRange, groupBy: 'day' });
    const chartData = (data as any)?.data || [];

    const formatRp = (val: number) => {
        const numVal = Number(val);
        if (isNaN(numVal)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numVal);
    };

    // Hitung Total Omzet dengan field 'revenue' yang benar
    const totalRevenue = chartData.reduce((acc: number, curr: any) => {
        const amount = Number(curr.revenue); // Ubah dari curr.total ke curr.revenue
        return acc + (isNaN(amount) ? 0 : amount);
    }, 0);

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

    if (error) return <div className="flex justify-center p-10 text-red-600">Error loading data</div>;

    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500">
                <p className="text-lg font-medium">Tidak ada data pendapatan</p>
                <p className="text-sm">Belum ada transaksi dalam 30 hari terakhir</p>
            </div>
        );
    }

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
            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Grafik Pendapatan Harian</CardTitle>
                </CardHeader>
                <CardBody className="h-[350px] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="period"
                                tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(val) => {
                                    const numVal = Number(val);
                                    return isNaN(numVal) ? '0' : `${(numVal / 1000).toFixed(0)}k`;
                                }}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={60}
                            />
                            <Tooltip
                                formatter={(value: any) => formatRp(Number(value))}
                                labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy')}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}
                            />
                            <Bar
                                dataKey="revenue"
                                name="Pendapatan"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}