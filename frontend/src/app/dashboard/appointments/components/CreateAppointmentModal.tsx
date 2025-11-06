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
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);

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
        setIsLoadingPatients(true);
        try {
            const response = await getAllPatients();
            // ✅ FIXED: Handle both paginated and non-paginated responses
            const patientData = response.data || response;
            setPatients(Array.isArray(patientData) ? patientData : []);
        } catch (err: any) {
            console.error('Failed to fetch patients', err);
            setError(err.message || 'Gagal memuat data pasien');
        } finally {
            setIsLoadingPatients(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validasi
        if (!patientId || !doctorId || !tanggalJanji || !jamJanji) {
            setError('Semua field wajib diisi');
            return;
        }

        // ✅ FIXED: Validasi tanggal tidak boleh di masa lalu
        const selectedDate = new Date(tanggalJanji);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            setError('Tanggal janji tidak boleh di masa lalu');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // ✅ FIXED: Format data sesuai backend DTO dengan validasi
            const appointmentData = {
                patient_id: Number(patientId),
                doctor_id: Number(doctorId),
                tanggal_janji: tanggalJanji,
                jam_janji: jamJanji.includes(':') ? jamJanji : `${jamJanji}:00`,
                keluhan: keluhan.trim() || undefined
            };

            await createAppointment(appointmentData);
            onCreateSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.message || 'Gagal membuat janji temu';
            setError(errorMessage);
            console.error('Error creating appointment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ✅ FIXED: Filter pasien dengan pengecekan yang lebih aman
    const availablePatients = patients.filter(p => 
        p && p.id && !scheduledPatientIds.includes(p.id)
    );
    
    const scheduledPatients = patients.filter(p => 
        p && p.id && scheduledPatientIds.includes(p.id)
    );

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

                {isLoadingPatients && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        <span>Memuat data pasien...</span>
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
                            disabled={isLoadingPatients}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="" disabled>
                                {isLoadingPatients ? 'Memuat...' : 'Pilih Pasien'}
                            </option>
                            
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
                        {availablePatients.length === 0 && patients.length > 0 && !isLoadingPatients && (
                            <p className="text-sm text-amber-600 mt-1">
                                ⚠️ Semua pasien sudah memiliki janji temu aktif
                            </p>
                        )}
                        {patients.length === 0 && !isLoadingPatients && (
                            <p className="text-sm text-gray-500 mt-1">
                                Tidak ada data pasien. Silakan tambahkan pasien terlebih dahulu.
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
                        <p className="text-xs text-gray-500 mt-1">
                            Minimal tanggal hari ini
                        </p>
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
                            step="1800"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Jam kerja klinik: 08:00 - 16:30 (interval 30 menit)
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
                            disabled={isSubmitting || availablePatients.length === 0 || isLoadingPatients}
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