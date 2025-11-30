'use client';

import { useMemo } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { User, Calendar, Stethoscope, Receipt, Pill, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MedicalRecordDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function MedicalRecordDetailModal({ isOpen, onClose, data }: MedicalRecordDetailModalProps) {
    // Jangan render apa-apa jika data null
    if (!data) return null;

    // Helper format rupiah
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // Ambil list treatments dengan aman
    const treatments = data.medical_record_treatments || [];

    // Hitung Total Biaya
    const totalBiaya = useMemo(() => {
        return treatments.reduce((sum: number, item: any) => {
            // Prioritas 1: Harga yang tersimpan di history (price_snapshot)
            // Prioritas 2: Harga master saat ini (treatment.harga)
            // Prioritas 3: 0
            const harga = Number(item.price_snapshot ?? item.treatment?.harga ?? 0);
            const qty = Number(item.jumlah ?? 1);
            return sum + (harga * qty);
        }, 0);
    }, [treatments]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Rekam Medis & Biaya"
            description={`No. Referensi: #${data.id}`}
            size="xl"
        >
            <div className="space-y-6 py-2">

                {/* 1. Header Informasi Pasien & Dokter */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    {/* Info Pasien */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full mt-1">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pasien</p>
                            <h4 className="font-bold text-gray-900">
                                {data.patient?.nama_lengkap || 'Data Pasien Terhapus'}
                            </h4>
                            <span className="text-sm text-gray-600 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                {data.patient?.nomor_rekam_medis || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Info Dokter */}
                    <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full mt-1">
                            <Stethoscope className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dokter Pemeriksa</p>
                            <h4 className="font-semibold text-gray-900">
                                {data.doctor?.nama_lengkap || 'Tidak Diketahui'}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                {data.created_at ? format(new Date(data.created_at), 'dd MMMM yyyy, HH:mm', { locale: id }) : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SOAP Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="border-l-4 border-yellow-400 pl-3 py-1 bg-yellow-50/50 rounded-r">
                            <h5 className="font-semibold text-gray-800 text-xs uppercase mb-1">Subjective (Keluhan)</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.subjektif || '-'}</p>
                        </div>
                        <div className="border-l-4 border-blue-400 pl-3 py-1 bg-blue-50/50 rounded-r">
                            <h5 className="font-semibold text-gray-800 text-xs uppercase mb-1">Objective (Pemeriksaan)</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.objektif || '-'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="border-l-4 border-red-400 pl-3 py-1 bg-red-50/50 rounded-r">
                            <h5 className="font-semibold text-gray-800 text-xs uppercase mb-1">Assessment (Diagnosa)</h5>
                            <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">{data.assessment || '-'}</p>
                        </div>
                        <div className="border-l-4 border-green-400 pl-3 py-1 bg-green-50/50 rounded-r">
                            <h5 className="font-semibold text-gray-800 text-xs uppercase mb-1">Plan (Resep/Instruksi)</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.plan || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Tabel Rincian Biaya & Tindakan */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-700 text-sm">Rincian Tindakan & Biaya</h3>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                            <tr>
                                <th className="px-4 py-2 font-medium">Tindakan / Perawatan</th>
                                <th className="px-4 py-2 font-medium text-right">Harga</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {treatments.length > 0 ? (
                                treatments.map((item: any, idx: number) => {
                                    const harga = Number(item.price_snapshot ?? item.treatment?.harga ?? 0);
                                    const namaTindakan = item.treatment?.namaPerawatan || 'Tindakan (Nama dihapus)';
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 flex items-center gap-2">
                                                <Pill className="w-3 h-3 text-indigo-500" />
                                                <span>{namaTindakan}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono text-gray-600">
                                                {formatRp(harga)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-4 text-center text-gray-400 italic flex flex-col items-center justify-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Tidak ada data tindakan tercatat.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t font-semibold">
                            <tr>
                                <td className="px-4 py-2 text-right text-gray-700">Total Biaya:</td>
                                <td className="px-4 py-2 text-right text-indigo-700 text-base">
                                    {formatRp(totalBiaya)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </Modal>
    );
}