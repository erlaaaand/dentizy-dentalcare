'use client';

import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/data-display/avatar';
import { Badge } from '@/components/ui/data-display/badge';
import { Calendar, Phone, MapPin, Mail, CreditCard, User } from 'lucide-react';
import { formatDate } from '@/core';

interface PatientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function PatientDetailModal({ isOpen, onClose, data }: PatientDetailModalProps) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Pasien"
            description={`No. Rekam Medis: ${data.nomor_rekam_medis}`}
            size="xl"
        >
            <div className="py-4 space-y-6">

                {/* Header Profile */}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100">
                    <Avatar
                        name={data.nama_lengkap}
                        size="xl"
                        className="mb-3 ring-4 ring-white shadow-sm"
                    />
                    <h3 className="text-xl font-bold text-gray-900">{data.nama_lengkap}</h3>
                    <div className="flex gap-2 mt-2">
                        <Badge variant={data.jenis_kelamin === 'L' ? 'info' : 'success'}>
                            {data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </Badge>
                        <Badge variant={data.is_active ? 'success' : 'error'}>
                            {data.is_active ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={<CreditCard className="w-4 h-4 text-gray-500" />} label="NIK" value={data.nik} />
                    <InfoItem icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Tanggal Lahir" value={formatDate(data.tanggal_lahir)} />
                    <InfoItem icon={<Phone className="w-4 h-4 text-green-500" />} label="No. Telepon" value={data.no_hp} />
                    <InfoItem icon={<Mail className="w-4 h-4 text-purple-500" />} label="Email" value={data.email} />
                    <div className="md:col-span-2">
                        <InfoItem icon={<MapPin className="w-4 h-4 text-red-500" />} label="Alamat" value={data.alamat} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </Modal>
    );
}

const InfoItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
            <p className="text-sm text-gray-900 font-medium">{value || '-'}</p>
        </div>
    </div>
);