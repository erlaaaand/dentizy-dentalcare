// Tipe data ini harus cocok persis dengan struktur objek yang dikirim oleh backend
// Termasuk relasi yang di-join (patient dan doctor)

export interface Patient {
    id: number;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    // ... properti pasien lainnya
}

export interface Doctor {
    id: number;
    nama_lengkap: string;
    username: string;
    // ... properti user lainnya
}

export interface Appointment {
    id: number;
    status: 'dijadwalkan' | 'selesai' | 'dibatalkan';
    tanggal_janji: string;
    jam_janji: string;
    keluhan?: string;
    patient: Patient; // Relasi ke pasien
    doctor: Doctor; // Relasi ke dokter
    created_at: string;
    updated_at: string;
}