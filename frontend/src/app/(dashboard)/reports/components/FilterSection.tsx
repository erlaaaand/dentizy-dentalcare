// src/app/(dashboard)/reports/components/FilterSection.tsx
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Calendar, Download } from 'lucide-react';

interface FilterSectionProps {
    startDate: string;
    endDate: string;
    maxDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
    onApply: () => void;
    onQuickFilter: (days: number) => void;
    onExport: () => void;
    hasData: boolean;
}

const QUICK_FILTERS = [
    { label: '7 Hari', days: 7 },
    { label: '14 Hari', days: 14 },
    { label: '30 Hari', days: 30 },
    { label: '60 Hari', days: 60 },
    { label: '90 Hari', days: 90 }
];

export const FilterSection = ({
    startDate,
    endDate,
    maxDate,
    onStartDateChange,
    onEndDateChange,
    onApply,
    onQuickFilter,
    onExport,
    hasData
}: FilterSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Filter Periode</span>
                    </CardTitle>
                    <button
                        onClick={onExport}
                        disabled={!hasData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 shadow-sm hover:shadow-md"
                        title={!hasData ? 'Tidak ada data untuk diekspor' : 'Ekspor laporan ke PDF'}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </CardHeader>
            
            <CardBody className="space-y-6">
                {/* Quick Filters */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Filter Cepat
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_FILTERS.map((filter) => (
                            <button
                                key={filter.days}
                                onClick={() => onQuickFilter(filter.days)}
                                className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200 hover:border-blue-300"
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Atau Pilih Rentang Tanggal Custom
                    </label>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-600 mb-2 block">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                max={maxDate}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>
                        
                        <div className="hidden sm:flex items-center pb-2.5 text-gray-400 font-medium">
                            →
                        </div>
                        
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-600 mb-2 block">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                max={maxDate}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>
                        
                        <button
                            onClick={onApply}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};