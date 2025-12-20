import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Calendar, Download } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface FilterSectionProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
    onApply: () => void;
    onQuickFilter: (days: number) => void;
    onExport: () => void;
    hasData: boolean;
}

export const FilterSection = ({
    startDate, endDate, onStartDateChange, onEndDateChange, 
    onApply, onQuickFilter, onExport, hasData
}: FilterSectionProps) => {
    const quickFilters = [
        { label: '7 Hari', days: 7 },
        { label: '30 Hari', days: 30 },
        { label: '90 Hari', days: 90 }
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Filter Periode
                    </CardTitle>
                    <button
                        onClick={onExport}
                        disabled={!hasData}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </CardHeader>
            <CardBody className="space-y-4">
                {/* Quick Filters */}
                <div className="flex gap-2">
                    {quickFilters.map(f => (
                        <button key={f.days} onClick={() => onQuickFilter(f.days)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {f.label}
                        </button>
                    ))}
                </div>
                {/* Date Inputs - (Sederhanakan kode input di sini) */}
                <div className="flex gap-3 items-end">
                     <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="border p-2 rounded" />
                     <span className="pb-2">-</span>
                     <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="border p-2 rounded" />
                     <button onClick={onApply} className="bg-blue-600 text-white px-4 py-2 rounded">Terapkan</button>
                </div>
            </CardBody>
        </Card>
    );
};