'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { getAllPatients } from '@/lib/api/patientService';

// Definisi tipe data Patient yang benar
type Patient = {
    id: number;
    nama_lengkap: string;
    alamat?: string;
    tanggal_lahir: string;
    no_hp?: string;
    jenis_kelamin?: 'L' | 'P';
    email?: string;
    created_at?: string;
    updated_at?: string;
};

type PatientsTableProps = {
    onDetailClick?: (patient: Patient) => void;
};

export default function PatientsTable({ onDetailClick }: PatientsTableProps) {
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchPatients() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getAllPatients();
                setPatients(data);
            } catch (err) {
                setError('Gagal memuat data pasien.');
                console.error('Error fetching patients:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPatients();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getGenderLabel = (gender?: 'L' | 'P') => {
        if (!gender) return '-';
        return gender === 'L' ? 'Laki-laki' : 'Perempuan';
    };

    if (isLoading) {
        return <div className="flex justify-center p-8">Memuat data pasien...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
    }

    if (!patients || patients.length === 0) {
        return <div className="text-gray-500 p-8 text-center">Tidak ada data pasien ditemukan</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama Lengkap
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jenis Kelamin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal Lahir
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No. Telepon
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Alamat
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient, index) => (
                            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {patient.nama_lengkap}
                                    </div>
                                    {patient.email && (
                                        <div className="text-sm text-gray-500">
                                            {patient.email}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getGenderLabel(patient.jenis_kelamin)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(patient.tanggal_lahir)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {patient.no_hp || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                        {patient.alamat || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => onDetailClick?.(patient)}
                                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                        title="Lihat Detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}