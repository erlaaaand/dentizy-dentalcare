"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  MessageIcon,
} from "../shared/Icons";
import { useBookPublicAppointment } from "@/core/services/api";
import {
  PublicBookingDto,
  PublicBookingDtoJenisKelamin,
} from "@/core/api/model";
import { useToast } from "@/core";
// Import hook yang baru digenerate (pastikan path ini benar sesuai struktur project Anda)
import { usePublicAppointmentsControllerGetDoctors } from "@/core/api/generated/public-appointments/public-appointments";

export function ContactSection() {
  // 1. Panggil API Public (Backend sudah menggabungkan Dokter + Ka. Klinik)
  const { data: doctorsData, isLoading: isLoadingDoctors } =
    usePublicAppointmentsControllerGetDoctors();

  const { mutate: bookAppointment, isPending } = useBookPublicAppointment();
  const { showSuccess, showError } = useToast();

  // 2. Memoize data dokter agar tidak re-render berlebih
  const AVAILABLE_DOCTORS = useMemo(() => {
    if (!doctorsData) return [];
    // Data dari backend sudah array bersih, langsung return
    return doctorsData;
  }, [doctorsData]);

  const [formData, setFormData] = useState<Partial<PublicBookingDto>>({
    nama_lengkap: "",
    nik: "",
    email: "",
    no_hp: "",
    alamat: "",
    jenis_kelamin: undefined, // undefined agar select mereset ke default
    tanggal_lahir: "",
    doctor_id: undefined,
    tanggal_janji: "",
    jam_janji: "",
    keluhan: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validasi input angka untuk NIK
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 16) {
      setFormData((prev) => ({
        ...prev,
        nik: val,
      }));
    }
  };

  // Validasi input angka/+ untuk No HP
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, "");
    setFormData((prev) => ({
      ...prev,
      no_hp: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi field krusial sebelum kirim
    if (!formData.doctor_id || !formData.tanggal_janji || !formData.jam_janji) {
      showError("Mohon lengkapi jadwal dan dokter yang diinginkan.");
      return;
    }

    if (!formData.nama_lengkap || !formData.nik || !formData.no_hp) {
      showError("Mohon lengkapi data diri Anda.");
      return;
    }

    const payload: PublicBookingDto = {
      nama_lengkap: formData.nama_lengkap,
      nik: formData.nik,
      email: formData.email,
      no_hp: formData.no_hp,
      alamat: formData.alamat || "-",
      jenis_kelamin: formData.jenis_kelamin as PublicBookingDtoJenisKelamin,
      tanggal_lahir: formData.tanggal_lahir!,
      doctor_id: Number(formData.doctor_id), // Konversi string ke number
      tanggal_janji: formData.tanggal_janji,
      // Format jam agar sesuai DTO (HH:mm:ss)
      jam_janji:
        formData.jam_janji.length === 5
          ? `${formData.jam_janji}:00`
          : formData.jam_janji,
      keluhan: formData.keluhan || "-",
    };

    bookAppointment(
      { data: payload },
      {
        onSuccess: () => {
          showSuccess(
            "Permintaan jadwal berhasil dikirim! Silakan datang ke klinik untuk verifikasi."
          );
          // Reset form
          setFormData({
            nama_lengkap: "",
            nik: "",
            email: "",
            no_hp: "",
            alamat: "",
            jenis_kelamin: undefined,
            tanggal_lahir: "",
            doctor_id: undefined,
            tanggal_janji: "",
            jam_janji: "",
            keluhan: "",
          });
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message ||
            "Gagal membuat jadwal. Silakan coba lagi.";
          showError(msg);
        },
      }
    );
  };

  return (
    <section
      id="kontak"
      className="py-20 bg-gradient-to-br from-gray-900 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Wujudkan <span className="text-blue-400">Senyum Impian</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Jadwalkan kunjungan Anda sekarang. Isi formulir di bawah ini untuk
            pendaftaran pasien baru maupun lama.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Info Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-2xl font-bold text-blue-400">
              Informasi Klinik
            </h3>

            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <InfoItem
                icon={<MapPinIcon className="w-5 h-5 text-white" />}
                title="Alamat"
                content="Jl. Kesehatan Raya No. 123, Jakarta Selatan 12560"
                gradientFrom="from-blue-500"
                gradientTo="to-blue-600"
              />
              <InfoItem
                icon={<PhoneIcon className="w-5 h-5 text-white" />}
                title="Kontak"
                content="(021) 123-4567 / 0812-3456-7890 (WA)"
                gradientFrom="from-blue-500"
                gradientTo="to-blue-700"
              />
              <InfoItem
                icon={<ClockIcon className="w-5 h-5 text-white" />}
                title="Jam Buka"
                content="Senin - Jumat: 09:00 - 21:00 / Sabtu - Minggu: 10:00 - 16:00"
                gradientFrom="from-blue-600"
                gradientTo="to-blue-800"
              />
            </div>

            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg gap-2 w-full"
            >
              <MessageIcon />
              Chat WhatsApp Admin
            </a>
          </div>

          {/* Form Section */}
          <div className="md:col-span-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Formulir Reservasi
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: Data Pasien */}
              <FormSection title="1. Data Pasien">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nama Lengkap"
                    name="nama_lengkap"
                    type="text"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Sesuai KTP"
                    required
                  />
                  <FormInput
                    label="NIK (16 Digit)"
                    name="nik"
                    type="text"
                    value={formData.nik}
                    onChange={handleNikChange}
                    placeholder="32xxxxxxxxxxxxxx"
                    required
                    minLength={16}
                    maxLength={16}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Tanggal Lahir"
                    name="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    required
                  />
                  <FormSelect
                    label="Jenis Kelamin"
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin || ""}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Pilih..." },
                      {
                        value: PublicBookingDtoJenisKelamin.L,
                        label: "Laki-laki",
                      },
                      {
                        value: PublicBookingDtoJenisKelamin.P,
                        label: "Perempuan",
                      },
                    ]}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="No. WhatsApp"
                    name="no_hp"
                    type="tel"
                    value={formData.no_hp}
                    onChange={handlePhoneChange}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@contoh.com (Opsional)"
                  />
                </div>

                <FormInput
                  label="Alamat Domisili"
                  name="alamat"
                  type="text"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Nama jalan, nomor rumah, kota"
                  required
                />
              </FormSection>

              {/* SECTION 2: Rencana Kunjungan */}
              <FormSection title="2. Rencana Kunjungan">
                <FormSelect
                  label="Pilih Dokter"
                  name="doctor_id"
                  value={formData.doctor_id || ""}
                  onChange={handleChange}
                  // Mapping data dokter + kepala klinik ke opsi dropdown
                  options={[
                    {
                      value: "",
                      label: isLoadingDoctors
                        ? "Memuat data dokter..."
                        : "-- Pilih Dokter & Layanan --",
                    },
                    ...AVAILABLE_DOCTORS.map((doc: any) => ({
                      value: doc.id,
                      label: doc.nama_lengkap || doc.username, // Fallback ke username jika nama kosong
                    })),
                  ]}
                  required
                  disabled={isLoadingDoctors}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Tanggal Rencana"
                    name="tanggal_janji"
                    type="date"
                    value={formData.tanggal_janji}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]} // Disable tanggal masa lalu
                    required
                  />
                  <div>
                    <FormInput
                      label="Jam Rencana"
                      name="jam_janji"
                      type="time"
                      value={formData.jam_janji}
                      onChange={handleChange}
                      min="09:00"
                      max="21:00"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Jam Praktik: 09:00 - 21:00
                    </p>
                  </div>
                </div>

                <FormTextarea
                  label="Keluhan Utama"
                  name="keluhan"
                  value={formData.keluhan}
                  onChange={handleChange}
                  placeholder="Jelaskan secara singkat keluhan gigi Anda..."
                  rows={3}
                />
              </FormSection>

              <button
                type="submit"
                disabled={isPending || isLoadingDoctors}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-6 h-6" />
                    <span>Kirim Reservasi Sekarang</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Dengan mengirim formulir ini, Anda menyetujui untuk dihubungi
                oleh staf klinik kami. Data Anda aman bersama kami.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Helper Components (Tidak ada perubahan signifikan, hanya type any dirapikan sedikit jika mau) ---

function InfoItem({ icon, title, content, gradientFrom, gradientTo }: any) {
  return (
    <div className="flex items-start space-x-4">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-gray-300 text-sm mt-1">{content}</div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FormInput({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label} {props.required && "*"}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none [color-scheme:dark]"
      />
    </div>
  );
}

function FormSelect({ label, options, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label} {props.required && "*"}
      </label>
      <select
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none appearance-none"
      >
        {options.map((opt: any, i: number) => (
          <option key={i} value={opt.value} className="bg-gray-800 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none"
      />
    </div>
  );
}
