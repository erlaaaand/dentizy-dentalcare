'use client';

import React, { useState, useEffect } from 'react';

type CreateAppointmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreateSuccess: () => void;
    doctors: { id: number; nama_lengkap: string; }[];
};

export default function CreateAppointmentModal({
    isOpen,
    onClose,
    onCreateSuccess,
    doctors
}: CreateAppointmentModalProps) {
    const [patientId, setPatientId] = useState<number | ''>('');
    const [doctorId, setDoctorId] = useState<number | ''>('');
    const [tanggalJanji, setTanggalJanji] = useState('');
    const [waktuJanji, setWaktuJanji] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [patients, setPatients] = useState<{ id: number; nama_lengkap: string; }[]>([]);
    const [scheduledPatientIds, setScheduledPatientIds] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset form saat modal dibuka
            setPatientId('');
            setDoctorId('');
            setTanggalJanji('');
            setWaktuJanji('');
            setError(null);
            fetchPatientsAndAppointments();
        }
    }, [isOpen]);

    const fetchPatientsAndAppointments = async () => {
        try {
            // Fetch patients
            const patientsResponse = await fetch('/api/patients');
            const patientsData = await patientsResponse.json();
            setPatients(patientsData);

            // Fetch appointments untuk cek pasien yang sudah dijadwalkan
            const appointmentsResponse = await fetch('/api/appointments');
            const appointmentsData = await appointmentsResponse.json();
            
            // Extract patient IDs yang sudah ada appointments (status bukan 'selesai' atau 'dibatalkan')
            const scheduledIds = appointmentsData
                .filter((apt: any) => apt.status !== 'selesai' && apt.status !== 'dibatalkan')
                .map((apt: any) => apt.patient_id);
            
            setScheduledPatientIds(scheduledIds);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Gagal memuat data pasien dan janji temu');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    doctor_id: doctorId,
                    tanggal_janji: tanggalJanji,
                    waktu_janji: waktuJanji
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create appointment');
            }
            onCreateSuccess();
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Filter pasien yang belum dijadwalkan untuk ditampilkan di bagian atas
    const availablePatients = patients.filter(p => !scheduledPatientIds.includes(p.id));
    const scheduledPatients = patients.filter(p => scheduledPatientIds.includes(p.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Buat Janji Temu Baru</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Pasien</label>
                        <select
                            value={patientId}
                            onChange={(e) => setPatientId(Number(e.target.value))}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Pilih Pasien</option>
                            
                            {/* Pasien yang tersedia */}
                            {availablePatients.length > 0 && (
                                <optgroup label="Tersedia">
                                    {availablePatients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.nama_lengkap}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            
                            {/* Pasien yang sudah dijadwalkan (disabled) */}
                            {scheduledPatients.length > 0 && (
                                <optgroup label="Sudah Ada Janji Temu">
                                    {scheduledPatients.map((patient) => (
                                        <option 
                                            key={patient.id} 
                                            value={patient.id}
                                            disabled
                                            className="text-gray-400"
                                        >
                                            {patient.nama_lengkap} (Sudah dijadwalkan)
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        {availablePatients.length === 0 && patients.length > 0 && (
                            <p className="text-sm text-amber-600 mt-1">
                                Semua pasien sudah memiliki janji temu aktif
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Dokter</label>
                        <select
                            value={doctorId}
                            onChange={(e) => setDoctorId(Number(e.target.value))}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Pilih Dokter</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.nama_lengkap}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tanggal Janji</label>
                        <input
                            type="date"
                            value={tanggalJanji}
                            onChange={(e) => setTanggalJanji(e.target.value)}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Waktu Janji</label>
                        <input
                            type="time"
                            value={waktuJanji}
                            onChange={(e) => setWaktuJanji(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || availablePatients.length === 0}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}