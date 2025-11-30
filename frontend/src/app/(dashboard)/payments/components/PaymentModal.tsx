'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { FormSelect } from '@/components/ui/forms/select';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, Receipt, Calculator, Printer } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from '@/core/services/http/axiosInstance';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    readOnly?: boolean;
}

// Helper: Format Input Rupiah (Real-time) - Sama seperti di TreatmentModal
const formatInputRupiah = (value: string | number) => {
    if (!value) return "";
    // Hapus semua karakter non-digit
    const clean = String(value).replace(/[^\d]/g, "");
    if (!clean) return "";
    // Format ke IDR (1.000.000)
    return new Intl.NumberFormat("id-ID").format(Number(clean));
};

export default function PaymentModal({ isOpen, onClose, data, readOnly = false }: PaymentModalProps) {
    const toast = useToast();
    const queryClient = useQueryClient();

    // State Form
    const [amountPaidStr, setAmountPaidStr] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('tunai');
    const [note, setNote] = useState('');

    const processMutation = useMutation({
        mutationFn: async (payload: any) => {
            return await customInstance({
                url: `/payments/${data.id}/process`,
                method: 'PATCH',
                data: payload
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/payments'] });
            queryClient.invalidateQueries({ queryKey: ['/appointments'] });
            toast.showSuccess(`Pembayaran Berhasil!`);
            onClose();
        },
        onError: (error: any) => {
            toast.showError(error?.response?.data?.message || 'Gagal memproses pembayaran.');
        }
    });

    useEffect(() => {
        if (isOpen && data) {
            if (readOnly) {
                setAmountPaidStr(data.jumlah_bayar?.toString() || data.jumlahBayar?.toString() || '');
                setPaymentMethod(data.metode_pembayaran || data.metodePembayaran || 'tunai');
                setNote(data.keterangan || '');
            } else {
                setAmountPaidStr('');
                setPaymentMethod('tunai');
                setNote('');
            }
        }
    }, [isOpen, data, readOnly]);

    // Format Helper untuk Display (Label/Text)
    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // --- LOGIKA KALKULASI ---
    const totalBill = Number(data?.totalAkhir ?? data?.total_akhir ?? data?.totalBiaya ?? 0);

    // Parse input string "1.000.000" menjadi number 1000000
    const amountPaid = Number(amountPaidStr.replace(/[^\d]/g, ''));

    const change = amountPaid - totalBill;
    const isSufficient = amountPaid >= totalBill;

    const handleProcess = () => {
        if (!isSufficient) return;

        const payload = {
            jumlah_bayar: amountPaid,
            metode_pembayaran: paymentMethod,
            keterangan: note
        };

        processMutation.mutate(payload);
    };

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={readOnly ? "Detail Transaksi" : "Kasir & Pembayaran"}
            description={`Invoice #${data.nomorInvoice || data.nomor_invoice || data.id}`}
            size="xl"
        >
            <div className="space-y-5 py-2">

                {/* 1. Card Total Tagihan */}
                <div className={`p-5 rounded-xl text-white shadow-md text-center ${readOnly ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Total Tagihan</p>
                    <h2 className="text-3xl font-bold">{formatRp(totalBill)}</h2>
                    <p className="text-sm mt-1 opacity-90">{data.patient?.nama_lengkap}</p>
                </div>

                {/* 2. Form Input */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {readOnly ? 'Uang Diterima' : 'Uang Diterima'}
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                className="text-lg font-bold h-12 border-blue-200 focus:border-blue-500"
                                placeholder="0"
                                // [FIX] Gunakan formatter saat render value
                                value={formatInputRupiah(amountPaidStr)}
                                onChange={(e) => {
                                    if (!readOnly) {
                                        // Simpan raw number string untuk kalkulasi
                                        const raw = e.target.value.replace(/[^\d]/g, "");
                                        setAmountPaidStr(raw);
                                    }
                                }}
                                disabled={readOnly}
                                autoFocus={!readOnly}
                                // [ADDED] Tambahkan Icon Rp seperti di TreatmentModal
                                leftIcon={<span className="text-gray-500 font-bold text-sm">Rp</span>}
                            />
                        </div>

                        {/* Quick Buttons (Uang Pas) - Hanya tampil saat bayar */}
                        {!readOnly && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setAmountPaidStr(totalBill.toString())}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-gray-600 border border-gray-300 font-medium transition-colors"
                                >
                                    Uang Pas
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Metode Bayar"
                            value={paymentMethod}
                            onChange={(val) => setPaymentMethod(val)}
                            disabled={readOnly}
                            options={[
                                { label: 'Tunai (Cash)', value: 'tunai' },
                                { label: 'Transfer Bank', value: 'transfer' },
                                { label: 'QRIS', value: 'qris' },
                                { label: 'Kartu Debit', value: 'kartu_debit' },
                                { label: 'Kartu Kredit', value: 'kartu_kredit' },
                            ]}
                        />
                        <Input
                            label="Catatan"
                            placeholder="Opsional..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>

                {/* 3. Info Kembalian */}
                <div className={`p-4 rounded-xl border-2 border-dashed flex justify-between items-center transition-colors ${isSufficient
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                    <span className="font-semibold flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Kembalian
                    </span>
                    <span className="text-2xl font-bold">
                        {isSufficient ? formatRp(change) : '-'}
                    </span>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 gap-3 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose} disabled={processMutation.isPending}>
                        {readOnly ? 'Tutup' : 'Batal'}
                    </Button>

                    {!readOnly ? (
                        <Button
                            onClick={handleProcess}
                            disabled={!isSufficient || processMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 w-full md:w-auto min-w-[140px]"
                        >
                            {processMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Receipt className="w-4 h-4 mr-2" />}
                            Proses Bayar
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => toast.showSuccess('Fitur cetak belum tersedia')}>
                            <Printer className="w-4 h-4 mr-2" /> Cetak Struk
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}