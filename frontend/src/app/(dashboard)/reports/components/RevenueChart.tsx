// src/app/(dashboard)/reports/components/RevenueChart.tsx
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRp, formatChartDate, formatTooltipDate, formatCompactNumber } from '../utils/formatters';
import { BarChart3, Info } from 'lucide-react';

interface RevenueChartProps {
    data: any[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
    if (data.length === 0) {
        return (
            <Card>
                <CardBody className="flex flex-col items-center justify-center p-16 text-gray-500">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <BarChart3 className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Tidak ada data pendapatan</p>
                    <p className="text-sm text-gray-400">Belum ada transaksi dalam periode yang dipilih</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span>Grafik Pendapatan Harian</span>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded-full">
                        <Info className="w-3.5 h-3.5" />
                        <span>{data.length} hari data</span>
                    </div>
                </div>
            </CardHeader>
            
            <CardBody className="h-[400px] p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data} 
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false} 
                            stroke="#f0f0f0" 
                        />
                        
                        <XAxis
                            dataKey="period"
                            tickFormatter={formatChartDate}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            height={50}
                        />
                        
                        <YAxis
                            tickFormatter={(val) => formatCompactNumber(Number(val))}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            width={70}
                        />
                        
                        <Tooltip
                            formatter={(value: any) => [formatRp(Number(value)), 'Pendapatan']}
                            labelFormatter={formatTooltipDate}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '13px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                        />
                        
                        <Bar
                            dataKey="revenue"
                            fill="#2563eb"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};