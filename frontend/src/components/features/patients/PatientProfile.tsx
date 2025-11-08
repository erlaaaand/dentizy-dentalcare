'use client';

import React, { useState, useEffect } from 'react';
import { Patient, Appointment } from '@/types/api';
import { patientService } from '@/lib/api';
import { useToastStore } from '@/lib/store/toastStore';
import { formatDate, formatAge, formatPhoneNumber, getInitials } from '@/lib/formatters';
import { User, Calendar, Phone, Mail, MapPin, FileText, Clock, Activity } from 'lucide-react';

interface PatientProfileProps {
    patientId: number;
    onEdit?: () => void;
}

export function PatientProfile({ patientId, onEdit }: PatientProfileProps) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const { error } = useToastStore();

    useEffect(() => {
        loadPatient();
        loadAppointmentHistory();
    }, [patientId]);

    const loadPatient = async () => {
        setLoading(true);
        try {
            const data = await patientService.getById(patientId);
            setPatient(data);
        } catch (err: any) {
            error(err.message || 'Gagal memuat data pasien');
        } finally {
            setLoading(false);
        }
    };

    const loadAppointmentHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await patientService.getHistory(patientId);
            setAppointments(data);
        } catch (err: any) {
            console.error('Failed to load appointment history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Data pasien tidak ditemukan</p>
            </div>
        );
    }

    const stats = {
        totalVisits: appointments.length,
        completedVisits: appointments.filter(a => a.status === 'selesai').length,
        upcomingVisits: appointments.filter(a => a.status === 'dijadwalkan').length,
    };

    return (
        <div className="space-y-6">
            {/* Patient Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {getInitials(patient.nama_lengkap)}
                        </div>

                        {/* Info */}
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{patient.nama_lengkap}</h2>
                            <p className="text-blue-100 mb-2">No. RM: {patient.nomor_rekam_medis}</p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                {patient.tanggal_lahir && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatAge(patient.tanggal_lahir)} • {formatDate(patient.tanggal_lahir)}</span>
                                    </div>
                                )}
                                {patient.jenis_kelamin && (
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        >
                            Edit Profil
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Kunjungan</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalVisits}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Kunjungan Selesai</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.completedVisits}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Janji Mendatang</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.upcomingVisits}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Informasi Kontak</h3>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {patient.no_hp && (
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600 mb-1">No. Telepon</p>
                                <p className="text-gray-900 font-medium">{formatPhoneNumber(patient.no_hp)}</p>
                            </div>
                        </div>
                    )}

                    {patient.email && (
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-gray-900 font-medium">{patient.email}</p>
                            </div>
                        </div>
                    )}

                    {patient.nik && (
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600 mb-1">NIK</p>
                                <p className="text-gray-900 font-medium">{patient.nik}</p>
                            </div>
                        </div>
                    )}

                    {patient.alamat && (
                        <div className="flex items-start gap-3 md:col-span-2">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Alamat</p>
                                <p className="text-gray-900">{patient.alamat}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Kunjungan</h3>
                </div>

                <div className="p-6">
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    ) : appointments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Belum ada riwayat kunjungan</p>
                    ) : (
                        <div className="space-y-4">
                            {appointments.slice(0, 5).map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {formatDate(appointment.tanggal_janji, 'dd MMMM yyyy')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Dokter: {appointment.doctor.nama_lengkap}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'selesai'
                                                    ? 'bg-green-100 text-green-800'
                                                    : appointment.status === 'dijadwalkan'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {appointment.status === 'selesai'
                                                ? 'Selesai'
                                                : appointment.status === 'dijadwalkan'
                                                    ? 'Dijadwalkan'
                                                    : 'Dibatalkan'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {appointments.length > 5 && (
                                <p className="text-center text-sm text-gray-600 pt-2">
                                    Dan {appointments.length - 5} kunjungan lainnya
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}