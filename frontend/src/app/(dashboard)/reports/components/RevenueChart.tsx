import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRp } from '../utils/formatters';

export const RevenueChart = ({ data }: { data: any[] }) => {
    if (data.length === 0) {
        return (
            <Card><CardBody className="p-10 text-center text-gray-500">Tidak ada data pendapatan</CardBody></Card>
        );
    }

    return (
        <Card>
            <CardHeader><CardTitle>Grafik Pendapatan Harian</CardTitle></CardHeader>
            <CardBody className="h-[350px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="period" 
                            tickFormatter={(str) => {
                                const d = new Date(str);
                                return `${d.getDate()}/${d.getMonth()+1}`;
                            }} 
                            tick={{ fontSize: 11 }} 
                        />
                        <YAxis 
                            tickFormatter={(val) => `${(Number(val)/1000).toFixed(0)}k`} 
                            tick={{ fontSize: 11 }} 
                        />
                        <Tooltip formatter={(value: any) => formatRp(Number(value))} />
                        <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};