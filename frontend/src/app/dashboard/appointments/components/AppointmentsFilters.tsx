'use client';

import React from 'react';

type FilterProps = {
    doctors: { id: number; name: string }[];
    onFilterChange: (filters: any) => void;
}

export default function AppointmentFilters({ doctors, onFilterChange }: FilterProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex space-x-4 items-center">
                <input type="date" className="border p-2 rounded-lg" />
                <select className="border p-2 rounded-lg">
                    <option value="">Semua Dokter</option>
                    {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                </select>
                <select className="border p-2 rounded-lg">
                    <option value="">Semua Status</option>
                    <option value="dijadwalkan">Terjadwal</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                </select>
            </div>
        </div>
    );
}