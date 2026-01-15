// frontend/src/app/(dashboard)/clinic/config/category-columns.tsx
import { FolderOpen, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';

interface CategoryColumnsProps {
    onEdit: (row: any) => void;
    onDelete: (row: any) => void;
    onRestore: (row: any) => void;
}

export const getCategoryColumns = ({ onEdit, onDelete, onRestore }: CategoryColumnsProps) => [
    {
        header: 'Nama Kategori',
        accessorKey: 'namaKategori',
        cell: (info: any) => (
            <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-50 rounded text-yellow-600">
                    <FolderOpen className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">{info.getValue()}</span>
            </div>
        )
    },
    {
        header: 'Deskripsi',
        accessorKey: 'deskripsi',
        cell: (info: any) => (
            <span className="text-gray-500 text-sm truncate max-w-xs block" title={info.getValue()}>
                {info.getValue() || '-'}
            </span>
        )
    },
    {
        header: 'Status',
        id: 'status',
        accessorKey: 'deletedAt',
        cell: (info: any) => {
            const isDeleted = !!info.row.original.deletedAt;
            return (
                <Badge variant={isDeleted ? 'error' : 'success'}>
                    {isDeleted ? 'Dihapus' : 'Aktif'}
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