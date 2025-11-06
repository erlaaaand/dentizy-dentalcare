'use client';

import React, { useState, useEffect } from 'react';
import { createAppointment } from '@/lib/api/appointmentService';
import { getAllPatients } from '@/lib/api/patientService';

type Patient = {
    id: number;
    nama_lengkap: string;
};

type Doctor = {
    id: number;
    nama_lengkap: string;
};

type CreateAppointmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreateSuccess: () => void;
    doctors: Doctor[];
    scheduledPatientIds: number[];
};

export default function CreateAppointmentModal({
    isOpen,
    onClose,
    onCreateSuccess,
    doctors,
    scheduledPatientIds
}: CreateAppointmentModalProps) {
    const [patientId, setPatientId] = useState<number | ''>('');
    const [doctorId, setDoctorId] = useState<number | ''>('');
    const [tanggalJanji, setTanggalJanji] = useState('');
    const [jamJanji, setJamJanji] = useState('');
    const [keluhan, setKeluhan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setPatientId('');
            setDoctorId('');
            setTanggalJanji('');
            setJamJanji('');
            setKeluhan('');
            setError(null);
            fetchPatients();
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        try {
            const data = await getAllPatients();
            setPatients(data.data || data); // Handle both paginated and non-paginated responses
        } catch (err) {
            console.error('Failed to fetch patients', err);
            setError('Gagal memuat data pasien');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validasi
        if (!patientId || !doctorId || !tanggalJanji || !jamJanji) {
            setError('Semua field wajib diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // ✅ Format data sesuai backend DTO
            await createAppointment({
                patient_id: Number(patientId),
                doctor_id: Number(doctorId),
                tanggal_janji: tanggalJanji, // Format: YYYY-MM-DD
                jam_janji: jamJanji + ':00', // Tambah detik: HH:mm:ss
                keluhan: keluhan || undefined
            });

            onCreateSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 
                               err.message || 
                               'Gagal membuat janji temu';
            setError(errorMessage);
            console.error('Error creating appointment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Filter pasien
    const availablePatients = patients.filter(p => !scheduledPatientIds.includes(p.id));
    const scheduledPatients = patients.filter(p => scheduledPatientIds.includes(p.id));

    // Get today's date for min date validation
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Buat Janji Temu Baru</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pasien */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Pasien <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={patientId}
                            onChange={(e) => setPatientId(Number(e.target.value))}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Pilih Pasien</option>
                            
                            {availablePatients.length > 0 && (
                                <optgroup label="✓ Tersedia">
                                    {availablePatients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.nama_lengkap}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            
                            {scheduledPatients.length > 0 && (
                                <optgroup label="⏱ Sudah Ada Janji Temu">
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
                                ⚠️ Semua pasien sudah memiliki janji temu aktif
                            </p>
                        )}
                    </div>

                    {/* Dokter */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Dokter <span className="text-red-500">*</span>
                        </label>
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

                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tanggal Janji <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={tanggalJanji}
                            onChange={(e) => setTanggalJanji(e.target.value)}
                            required
                            min={today}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Jam */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Waktu Janji <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            value={jamJanji}
                            onChange={(e) => setJamJanji(e.target.value)}
                            required
                            min="08:00"
                            max="16:30"
                            step="1800" // 30 menit interval
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Jam kerja klinik: 08:00 - 16:30
                        </p>
                    </div>

                    {/* Keluhan (Optional) */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Keluhan (Opsional)
                        </label>
                        <textarea
                            value={keluhan}
                            onChange={(e) => setKeluhan(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="Tuliskan keluhan pasien..."
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {keluhan.length}/1000 karakter
                        </p>
                    </div>

                    {/* Actions */}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isSubmitting || availablePatients.length === 0}
                        >
                            {isSubmitting && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}