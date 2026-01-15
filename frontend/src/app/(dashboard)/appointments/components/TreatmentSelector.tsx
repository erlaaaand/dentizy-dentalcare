'use client';

import { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
// Pastikan path import ini sesuai dengan struktur project Anda
import { useTreatmentsControllerFindAll } from '@/core/api/generated/treatments/treatments';

interface TreatmentSelectorProps {
    selectedIds: number[];
    onChange: (ids: number[], selectedItems: any[]) => void;
    disabled?: boolean;
}

export default function TreatmentSelector({ selectedIds, onChange, disabled }: TreatmentSelectorProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Fetch Data Tindakan (Ambil 50 item aktif)
    const { data: response, isLoading } = useTreatmentsControllerFindAll({
        page: 1,
        limit: 50,
        // Asumsi backend support filter search & isActive
        // Jika parameter di API Anda berbeda, sesuaikan di sini (misal: 'q' atau 'keyword')
        search: search,
        isActive: true
    });

    const treatments = useMemo(() => (response as any)?.data || [], [response]);

    // Handle Klik Item
    const handleToggle = (item: any) => {
        const isSelected = selectedIds.includes(item.id);
        let newIds: number[];

        if (isSelected) {
            newIds = selectedIds.filter(id => id !== item.id);
        } else {
            newIds = [...selectedIds, item.id];
        }

        // Cari object lengkap dari ID yang terpilih (untuk kalkulasi harga di parent)
        // Note: Ini hanya mencari dari data yang sedang di-load. 
        // Idealnya jika data banyak, logic ini perlu disesuaikan.
        const allSelectedObjects = treatments.filter((t: any) => newIds.includes(t.id));

        onChange(newIds, allSelectedObjects);
    };

    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <div className="relative space-y-2">
            {/* Input Search */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari tindakan (e.g: Scalling)..."
                    className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
                {isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 text-center text-xs text-gray-500">Memuat data...</div>
                    ) : treatments.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-500">Tidak ditemukan.</div>
                    ) : (
                        <ul>
                            {treatments.map((item: any) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <li
                                        key={item.id}
                                        onClick={() => handleToggle(item)}
                                        className={`px-3 py-2 cursor-pointer text-sm flex justify-between items-center hover:bg-blue-50 ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                    >
                                        <div className="flex flex-col">
                                            {/* Sesuai entity: namaPerawatan & harga */}
                                            <span className="font-medium">{item.namaPerawatan}</span>
                                            <span className="text-xs text-gray-500">{formatRp(Number(item.harga))}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}