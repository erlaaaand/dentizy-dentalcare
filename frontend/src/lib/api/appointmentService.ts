import api from './axiosInstance';
import { Appointment } from '@/types/api';

// --- Tipe Data DTO ---
interface FindAppointmentsQuery {
  doctorId?: number | string; // Izinkan string agar bisa menerima '' dari form
  date?: string;
  status?: 'dijadwalkan' | 'selesai' | 'dibatalkan' | ''; // Izinkan string kosong
  page?: number;
  limit?: number;
}

interface CreateAppointmentDto {
  patient_id: number;
  doctor_id: number;
  tanggal_janji: string;
  jam_janji: string;
  keluhan?: string;
}

interface UpdateAppointmentDto {
  tanggal_janji?: string;
  jam_janji?: string;
  status?: 'dijadwalkan' | 'selesai' | 'dibatalkan';
  keluhan?: string;
}

// --- Tipe Data Respons Paginasi ---
interface PaginatedAppointments {
    data: Appointment[];
    count: number;
    page: number;
    limit: number;
}

// --- Fungsi-fungsi API ---

/**
 * Mengambil daftar janji temu dengan filter dan paginasi.
 * @param params - Objek berisi filter dan paginasi.
 */
export const getAppointments = async (params: FindAppointmentsQuery = {}): Promise<PaginatedAppointments> => {
  try {
    // --- PERBAIKAN DI SINI ---
    // Buat objek baru untuk menampung parameter yang aktif saja
    const activeParams: { [key: string]: any } = {};

    // Iterasi melalui parameter yang diterima
    Object.entries(params).forEach(([key, value]) => {
      // Hanya tambahkan parameter ke request jika nilainya tidak kosong
      if (value !== null && value !== undefined && value !== '') {
        activeParams[key] = value;
      }
    });
    // --- AKHIR PERBAIKAN ---

    const response = await api.get('/appointments', { params: activeParams }); // Gunakan parameter yang sudah dibersihkan
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data janji temu:', error);
    throw error;
  }
};

/**
 * Mengambil satu data janji temu berdasarkan ID.
 */
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil janji temu dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Membuat janji temu baru.
 */
export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  try {
    const response = await api.post('/appointments', data);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat janji temu:', error);
    throw error;
  }
};

/**
 * Mengubah status janji temu menjadi 'selesai'.
 */
export const completeAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.post(`/appointments/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error(`Gagal menyelesaikan janji temu dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mengubah status janji temu menjadi 'dibatalkan'.
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.post(`/appointments/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Gagal membatalkan janji temu dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mengupdate data janji temu.
 */
export const updateAppointment = async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
  try {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengupdate janji temu dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menghapus janji temu.
 */
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error) {
    console.error(`Gagal menghapus janji temu dengan ID ${id}:`, error);
    throw error;
  }
};

