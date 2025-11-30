import { UserCheck, Phone, MapPin, CalendarDays, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PublicPatientColumnsProps {
    onVerify: (row: any) => void;
}

export const getPublicPatientColumns = ({ onVerify }: PublicPatientColumnsProps) => [
    {
        header: 'Nama Pasien',
        accessorKey: 'nama_lengkap',
        cell: (info: any) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-900">{info.getValue()}</span>
                <span className="text-xs text-gray-500 font-mono">NIK: {info.row.original.nik}</span>
            </div>
        )
    },
    {
        header: 'Kontak',
        accessorKey: 'no_hp',
        cell: (info: any) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Phone className="w-3 h-3" /> {info.getValue()}
                </div>
                {info.row.original.email && (
                    <span className="text-xs text-gray-500 ml-4">{info.row.original.email}</span>
                )}
            </div>
        )
    },
    {
        header: 'Data Diri',
        accessorKey: 'tanggal_lahir',
        cell: (info: any) => {
            const date = info.getValue();
            const jk = info.row.original.jenis_kelamin;
            return (
                <div className="flex flex-col text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {date ? format(new Date(date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </div>
                    <span className="ml-4 font-medium">{jk === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
            );
        }
    },
    {
        header: 'Alamat',
        accessorKey: 'alamat',
        cell: (info: any) => (
            <div className="flex items-start gap-1 max-w-[200px]">
                <MapPin className="w-3 h-3 mt-1 shrink-0 text-gray-400" />
                <span className="text-sm text-gray-600 truncate" title={info.getValue()}>
                    {info.getValue()}
                </span>
            </div>
        )
    },
    {
        header: 'Status',
        id: 'status',
        cell: () => (
            <Badge variant="warning" className="flex items-center gap-1 w-fit">
                <AlertCircle className="w-3 h-3" /> Perlu Verifikasi
            </Badge>
        )
    },
    {
        header: 'Aksi',
        id: 'actions',
        cell: (info: any) => (
            <Button
                size="sm"
                onClick={() => onVerify(info.row.original)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
            >
                <UserCheck className="w-4 h-4 mr-2" />
                Verifikasi & Aktifkan
            </Button>
        )
    }
];