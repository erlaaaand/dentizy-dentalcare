// frontend/src/app/(dashboard)/clinic/config/treatment-columns.tsx
import { Stethoscope, Edit, Trash2, RotateCcw, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { formatCurrency } from '@/core/utils/date/format.utils';

interface TreatmentColumnsProps {
    onEdit: (row: any) => void;
    onDelete: (row: any) => void;
    onRestore: (row: any) => void;
    onActivate: (row: any) => void;
    onDeactivate: (row: any) => void;
}

export const getTreatmentColumns = ({
    onEdit,
    onDelete,
    onRestore,
    onActivate,
    onDeactivate
}: TreatmentColumnsProps) => [
        {
            header: 'Kode',
            accessorKey: 'kodePerawatan',
            cell: (info: any) => (
                <span className="font-mono text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                    {info.getValue()}
                </span>
            )
        },
        {
            header: 'Nama Layanan',
            accessorKey: 'namaPerawatan',
            cell: (info: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{info.getValue()}</span>
                        {info.row.original.category && (
                            <span className="text-xs text-gray-500 md:hidden">
                                {info.row.original.category.namaKategori}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
            cell: (info: any) => {
                const category = info.getValue();
                return (
                    <Badge variant="outline" className="text-xs">
                        {category?.namaKategori || 'Umum'}
                    </Badge>
                );
            }
        },
        {
            header: 'Harga',
            accessorKey: 'harga',
            cell: (info: any) => (
                <span className="font-semibold text-green-700 whitespace-nowrap">
                    {formatCurrency(Number(info.getValue()))}
                </span>
            )
        },
        {
            header: 'Durasi',
            accessorKey: 'durasiEstimasi',
            cell: (info: any) => (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {info.getValue() || '-'} menit
                </span>
            )
        },
        {
            header: 'Status',
            id: 'status',
            accessorKey: 'isActive',
            cell: (info: any) => {
                const row = info.row.original;
                const isDeleted = !!row.deletedAt;
                const isActive = row.isActive;

                if (isDeleted) {
                    return <Badge variant="error">Dihapus</Badge>;
                }

                return (
                    <Badge variant={isActive ? 'success' : 'secondary'}>
                        {isActive ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => {
                const row = info.row.original;
                const isDeleted = !!row.deletedAt;
                const isActive = row.isActive;

                if (isDeleted) {
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRestore(row)}
                            title="Pulihkan"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        {isActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeactivate(row)}
                                title="Nonaktifkan"
                            >
                                <PowerOff className="w-4 h-4 text-orange-500" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onActivate(row)}
                                title="Aktifkan"
                            >
                                <Power className="w-4 h-4 text-green-500" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            title="Edit"
                        >
                            <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                );
            }
        }
    ];