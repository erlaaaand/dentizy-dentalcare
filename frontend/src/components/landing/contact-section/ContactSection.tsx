'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Phone, Clock, Calendar, MessageCircle, User, FileText, Home } from 'lucide-react';
import { useBookPublicAppointment } from '@/core/services/api';
import { PublicBookingDto, PublicBookingDtoJenisKelamin, UsersControllerFindAllRole } from '@/core/api/model';
import { useToast } from '@/core';
import { useUsersControllerFindAll } from '@/core/api/generated/users/users';

export function ContactSection() {
    // Pindahkan semua hooks ke dalam body component
    const { data: doctorsData } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.dokter,
        limit: 50,
        isActive: true
    });

    const { data: headsData } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.kepala_klinik,
        limit: 50,
        isActive: true
    });

    const AVAILABLE_DOCTORS = useMemo(() => {
        const doctors = (doctorsData as any)?.data ?? [];
        const heads = (headsData as any)?.data ?? [];
        return [...doctors, ...heads];
    }, [doctorsData, headsData]);

    const { mutate: bookAppointment, isPending } = useBookPublicAppointment();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<Partial<PublicBookingDto>>({
        nama_lengkap: '',
        nik: '',
        email: '',
        no_hp: '',
        alamat: '',
        jenis_kelamin: undefined,
        tanggal_lahir: '',
        doctor_id: undefined,
        tanggal_janji: '',
        jam_janji: '',
        keluhan: ''
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Hanya angka
        if (val.length <= 16) {
            setFormData(prev => ({
                ...prev,
                nik: val
            }));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9+]/g, ''); // Hanya angka dan +
        setFormData(prev => ({
            ...prev,
            no_hp: val
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.doctor_id || !formData.tanggal_janji || !formData.jam_janji) {
            showError('Mohon lengkapi jadwal dan dokter yang diinginkan.');
            return;
        }

        const payload: PublicBookingDto = {
            nama_lengkap: formData.nama_lengkap!,
            nik: formData.nik!,
            email: formData.email,
            no_hp: formData.no_hp!,
            alamat: formData.alamat!,
            jenis_kelamin: formData.jenis_kelamin as PublicBookingDtoJenisKelamin,
            tanggal_lahir: formData.tanggal_lahir!,
            doctor_id: Number(formData.doctor_id),
            tanggal_janji: formData.tanggal_janji!,
            jam_janji: formData.jam_janji?.length === 5 ? `${formData.jam_janji}:00` : formData.jam_janji!,
            keluhan: formData.keluhan || '-',
        };

        bookAppointment({ data: payload }, {
            onSuccess: () => {
                showSuccess('Permintaan jadwal berhasil dikirim! Silakan datang ke klinik untuk verifikasi.');
                setFormData({
                    nama_lengkap: '',
                    nik: '',
                    email: '',
                    no_hp: '',
                    alamat: '',
                    jenis_kelamin: undefined,
                    tanggal_lahir: '',
                    doctor_id: undefined,
                    tanggal_janji: '',
                    jam_janji: '',
                    keluhan: ''
                });
            },
            onError: (error: any) => {
                const msg = error?.response?.data?.message || 'Gagal membuat jadwal. Silakan coba lagi.';
                showError(msg);
            }
        });
    };

    return (
        <section id="kontak" className="py-20 bg-gradient-to-br from-gray-900 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Wujudkan <span className="text-cyan-400">Senyum Impian</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Jadwalkan kunjungan Anda sekarang. Isi formulir di bawah ini untuk pendaftaran pasien baru maupun lama.
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-12 max-w-7xl mx-auto">
                    <div className="md:col-span-4 space-y-8 h-fit">
                        <h3 className="text-2xl font-bold text-cyan-400">Informasi Klinik</h3>

                        <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold">Alamat</div>
                                    <div className="text-gray-300 text-sm mt-1">
                                        Jl. Kesehatan Raya No. 123<br />Jakarta Selatan 12560
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold">Kontak</div>
                                    <div className="text-gray-300 text-sm mt-1">
                                        (021) 123-4567<br />
                                        0812-3456-7890 (WA)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold">Jam Buka</div>
                                    <div className="text-gray-300 text-sm mt-1">
                                        Senin - Jumat: 09:00 - 21:00<br />
                                        Sabtu - Minggu: 10:00 - 16:00
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 gap-2 w-full shadow-lg shadow-green-900/20"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat WhatsApp Admin
                        </a>
                    </div>

                    <div className="md:col-span-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            Formulir Reservasi
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                                    1. Data Pasien
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="nama_lengkap"
                                                value={formData.nama_lengkap}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                                placeholder="Sesuai KTP"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">NIK (16 Digit) *</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="nik"
                                                value={formData.nik}
                                                onChange={handleNikChange}
                                                required
                                                minLength={16}
                                                maxLength={16}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                                placeholder="32xxxxxxxxxxxxxx"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Tanggal Lahir *</label>
                                        <input
                                            type="date"
                                            name="tanggal_lahir"
                                            value={formData.tanggal_lahir}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Jenis Kelamin *</label>
                                        <select
                                            name="jenis_kelamin"
                                            value={formData.jenis_kelamin}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none appearance-none"
                                        >
                                            <option value="" className="bg-gray-800">Pilih...</option>
                                            <option value={PublicBookingDtoJenisKelamin.L} className="bg-gray-800">Laki-laki</option>
                                            <option value={PublicBookingDtoJenisKelamin.P} className="bg-gray-800">Perempuan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">No. WhatsApp *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="no_hp"
                                                value={formData.no_hp}
                                                onChange={handlePhoneChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                                placeholder="08xxxxxxxxxx"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                            placeholder="email@contoh.com (Opsional)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Alamat Domisili *</label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="alamat"
                                            value={formData.alamat}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                            placeholder="Nama jalan, nomor rumah, kota"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-2">
                                    2. Rencana Kunjungan
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-cyan-400 mb-1">Pilih Dokter *</label>
                                    <select
                                        name="doctor_id"
                                        value={formData.doctor_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                    >
                                        <option value="" className="bg-gray-800">-- Pilih Dokter & Layanan --</option>
                                        {AVAILABLE_DOCTORS.map((doc) => (
                                            <option key={doc.id} value={doc.id} className="bg-gray-800">
                                                {doc.nama_lengkap || doc.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Tanggal Rencana *</label>
                                        <input
                                            type="date"
                                            name="tanggal_janji"
                                            value={formData.tanggal_janji}
                                            onChange={handleChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Jam Rencana *</label>
                                        <input
                                            type="time"
                                            name="jam_janji"
                                            value={formData.jam_janji}
                                            onChange={handleChange}
                                            required
                                            min="09:00"
                                            max="21:00"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none [color-scheme:dark]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Jam Praktik: 09:00 - 21:00</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Keluhan Utama</label>
                                    <textarea
                                        name="keluhan"
                                        value={formData.keluhan}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                                        placeholder="Jelaskan secara singkat keluhan gigi Anda..."
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </span>
                                ) : (
                                    <>
                                        <Calendar className="w-6 h-6" />
                                        <span>Kirim Reservasi Sekarang</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                * Dengan mengirim formulir ini, Anda menyetujui untuk dihubungi oleh staf klinik kami. Data Anda aman bersama kami.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}