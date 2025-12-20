import { Card, CardBody } from '@/components/ui/data-display/card';
import { DollarSign } from 'lucide-react';
import { formatRp, formatDisplayDate } from '../utils/formatters';

interface SummaryCardsProps {
    totalRevenue: number;
    chartData: any[];
    dateRange: { startDate: string; endDate: string };
}

export const SummaryCards = ({ totalRevenue, chartData, dateRange }: SummaryCardsProps) => {
    const average = chartData.length > 0 ? totalRevenue / chartData.length : 0;
    const maxRevenue = Math.max(...chartData.map((d: any) => Number(d.revenue) || 0), 0);

    const CardItem = ({ title, value, sub, color }: any) => (
        <Card className={`${color} text-white border-none`}>
            <CardBody className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-medium opacity-90">{title}</p>
                        <h3 className="text-2xl font-bold">{formatRp(value)}</h3>
                        <p className="text-xs opacity-75 mt-1">{sub}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardItem 
                title="Total Pendapatan" 
                value={totalRevenue} 
                sub={`${formatDisplayDate(new Date(dateRange.startDate))} - ${formatDisplayDate(new Date(dateRange.endDate))}`}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <CardItem 
                title="Rata-rata per Hari" 
                value={average} 
                sub={`${chartData.length} hari`}
                color="bg-gradient-to-br from-green-600 to-green-700"
            />
            <CardItem 
                title="Pendapatan Tertinggi" 
                value={maxRevenue} 
                sub="Dalam periode ini"
                color="bg-gradient-to-br from-purple-600 to-purple-700"
            />
        </div>
    );
};