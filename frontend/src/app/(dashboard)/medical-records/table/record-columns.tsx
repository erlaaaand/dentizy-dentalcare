import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RecordColumnsProps {
    onView: (row: any) => void;
    showDoctorColumn: boolean;
}

// Helper format rupiah
const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export const getRecordColumns = ({ onView, showDoctorColumn }: RecordColumnsProps) => [
    {
        header: 'Tanggal',
        accessorKey: 'created_at',
        cell: (info: any) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                    {info.getValue() ? format(new Date(info.getValue()), 'dd MMM yyyy', { locale: id }) : '-'}
                </span>
                <span className="text-xs text-gray-500">
                    {info.getValue() ? format(new Date(info.getValue()), 'HH:mm', { locale: id }) : ''} WIB
                </span>
            </div>
        )
    },
    {
        header: 'Pasien',
        accessorKey: 'patient',
        cell: (info: any) => {
            const patient = info.getValue();
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {patient?.nama_lengkap || <span className="text-red-400 italic">Tanpa Nama</span>}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                        {patient?.nomor_rekam_medis || '-'}
                    </span>
                </div>
            );
        }
    },
    // Kolom Dokter (Kondisional)
    ...(showDoctorColumn ? [{
        header: 'Dokter',
        accessorKey: 'doctor',
        cell: (info: any) => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                    Dr
                </div>
                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {info.getValue()?.nama_lengkap || '-'}
                </span>
            </div>
        )
    }] : []),
    {
        header: 'Diagnosa',
        accessorKey: 'assessment',
        cell: (info: any) => (
            <span className="text-sm text-gray-600 italic truncate max-w-[200px] block" title={info.getValue()}>
                {info.getValue() || '-'}
            </span>
        )
    },
    // [PENTING] Kolom Total Biaya
    {
        header: 'Total Biaya',
        id: 'total_cost',
        cell: (info: any) => {
            // Ambil array treatments dari row data
            const treatments = info.row.original.medical_record_treatments || [];

            // Hitung total dengan logika yang sama seperti di Modal
            const total = treatments.reduce((sum: number, item: any) => {
                const harga = Number(item.price_snapshot ?? item.treatment?.harga ?? 0);
                const qty = Number(item.jumlah ?? 1);
                return sum + (harga * qty);
            }, 0);

            return (
                <div className="flex items-center gap-1 text-sm font-mono text-gray-700 font-medium">
                    {total > 0 ? formatRp(total) : <span className="text-gray-400">-</span>}
                </div>
            );
        }
    },
    {
        header: 'Aksi',
        id: 'actions',
        cell: (info: any) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(info.row.original)}
                className="text-blue-600 hover:bg-blue-50"
                title="Lihat Detail & Biaya"
            >
                <Eye className="w-4 h-4 mr-2" /> Detail
            </Button>
        )
    }
];