import { CheckCircle, XCircle, Clock, Edit, CheckSquare, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AppointmentColumnsProps {
    onComplete: (row: any) => void;
    onCancel: (row: any) => void;
    onEdit: (row: any) => void;
    isDoctor: boolean;
    isHeadOrStaff: boolean;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'dijadwalkan':
            return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Dijadwalkan</Badge>;
        case 'selesai':
            return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Selesai</Badge>;
        case 'dibatalkan':
            return <Badge variant="error" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Dibatalkan</Badge>;
        case 'menunggu_konfirmasi':
            return <Badge variant="info" className="flex items-center gap-1">Menunggu Konfirmasi</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export const getAppointmentColumns = ({ onComplete, onCancel, onEdit, isDoctor, isHeadOrStaff }: AppointmentColumnsProps) => [
    {
        header: 'Waktu',
        accessorKey: 'tanggal_janji',
        cell: (info: any) => {
            const date = info.getValue();
            const time = info.row.original.jam_janji;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {date ? format(new Date(date), 'dd MMMM yyyy', { locale: id }) : '-'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {time ? time.substring(0, 5) : '-'}
                    </span>
                </div>
            );
        }
    },
    {
        header: 'Pasien',
        accessorKey: 'patient',
        cell: (info: any) => {
            const patient = info.getValue();
            const isOnline = patient?.is_registered_online;
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{patient?.nama_lengkap || 'Tanpa Nama'}</span>
                        {isOnline && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-blue-200 text-blue-700 bg-blue-50">Web</Badge>}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{patient?.nomor_rekam_medis || 'No RM -'}</span>
                </div>
            );
        }
    },
    // Kolom Dokter: Tampilkan jika yang login BUKAN dokter (supaya Head/Staff tau ini pasien siapa)
    ...(isHeadOrStaff ? [{
        header: 'Dokter',
        accessorKey: 'doctor',
        cell: (info: any) => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    Dr
                </div>
                <span className="text-sm text-gray-700 font-medium">
                    {info.getValue()?.nama_lengkap || '-'}
                </span>
            </div>
        )
    }] : []),
    {
        header: 'Keluhan',
        accessorKey: 'keluhan',
        cell: (info: any) => (
            <span className="text-sm text-gray-600 truncate max-w-[200px] block" title={info.getValue()}>
                {info.getValue() || '-'}
            </span>
        )
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: (info: any) => getStatusBadge(info.getValue())
    },
    {
        header: 'Aksi',
        id: 'actions',
        cell: (info: any) => {
            const row = info.row.original;
            const isScheduled = row.status === 'dijadwalkan' || row.status === 'menunggu_konfirmasi';

            if (!isScheduled) return <span className="text-xs text-gray-400 font-italic">Tidak ada aksi</span>;

            return (
                <div className="flex items-center gap-1">
                    {/* DOKTER & STAFF/HEAD: Bisa Selesaikan (Medis/Admin) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComplete(row)}
                        title="Selesaikan & Isi Rekam Medis"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                        {isDoctor ? <Stethoscope className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    </Button>

                    {/* HANYA STAFF/HEAD: Bisa Edit & Batalkan */}
                    {isHeadOrStaff && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row)}
                                title="Ubah Jadwal / Dokter"
                                className="text-blue-600 hover:bg-blue-50"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCancel(row)}
                                title="Batalkan Janji"
                                className="text-red-500 hover:bg-red-50"
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            );
        }
    }
];