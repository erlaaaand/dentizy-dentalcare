// src/app/(dashboard)/reports/components/SummaryCards.tsx
import { Card, CardBody } from '@/components/ui/data-display/card';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { formatRp, formatDisplayDate } from '../utils/formatters';

interface SummaryCardsProps {
    totalRevenue: number;
    averageRevenue: number;
    maxRevenue: number;
    totalDays: number;
    dateRange: { startDate: string; endDate: string };
}

interface CardItemProps {
    title: string;
    value: number;
    subtitle: string;
    color: string;
    icon: React.ReactNode;
}

const CardItem = ({ title, value, subtitle, color, icon }: CardItemProps) => (
    <Card className={`${color} text-white border-none shadow-lg hover:shadow-xl transition-all`}>
        <CardBody className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-90 mb-2">
                        {title}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                        {formatRp(value)}
                    </h3>
                    <p className="text-xs opacity-80 font-medium">
                        {subtitle}
                    </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
            </div>
        </CardBody>
    </Card>
);

export const SummaryCards = ({
    totalRevenue,
    averageRevenue,
    maxRevenue,
    totalDays,
    dateRange
}: SummaryCardsProps) => {
    const startDateFormatted = formatDisplayDate(new Date(dateRange.startDate));
    const endDateFormatted = formatDisplayDate(new Date(dateRange.endDate));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CardItem
                title="Total Pendapatan"
                value={totalRevenue}
                subtitle={`${startDateFormatted} - ${endDateFormatted}`}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
                icon={<DollarSign className="w-7 h-7 text-white" />}
            />
            
            <CardItem
                title="Rata-rata per Hari"
                value={averageRevenue}
                subtitle={`Berdasarkan ${totalDays} hari transaksi`}
                color="bg-gradient-to-br from-green-600 to-green-700"
                icon={<TrendingUp className="w-7 h-7 text-white" />}
            />
            
            <CardItem
                title="Pendapatan Tertinggi"
                value={maxRevenue}
                subtitle="Dalam periode ini"
                color="bg-gradient-to-br from-purple-600 to-purple-700"
                icon={<Award className="w-7 h-7 text-white" />}
            />
        </div>
    );
};