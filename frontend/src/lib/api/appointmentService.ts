import api from './axiosInstance';
import { Appointment } from '@/types/api';

// --- Tipe Data DTO ---
interface FindAppointmentsQuery {
  doctorId?: number | string;
  date?: string;
  status?: 'dijadwalkan' | 'selesai' | 'dibatalkan' | '';
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
  totalPages: number;
}

// --- Fungsi-fungsi API ---

/**
 * ✅ FIXED: Mengambil daftar janji temu dengan filter
 * Backend structure: { data, count, page, limit, totalPages }
 */
export const getAppointments = async (params: FindAppointmentsQuery = {}): Promise<PaginatedAppointments> => {
  try {
    // Buat objek baru untuk menampung parameter yang valid
    const cleanParams: { [key: string]: any } = {};

    // Hanya tambahkan parameter yang memiliki nilai valid
    Object.entries(params).forEach(([key, value]) => {
      // Abaikan nilai null, undefined, atau string kosong
      if (value !== null && value !== undefined && value !== '') {
        // Konversi doctorId menjadi number jika berupa string
        if (key === 'doctorId' && typeof value === 'string') {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue)) {
            cleanParams[key] = numValue;
          }
        } else {
          cleanParams[key] = value;
        }
      }
    });

    const response = await api.get('/appointments', { params: cleanParams });

    // ✅ Backend returns: { data, count, page, limit, totalPages }
    return {
      data: response.data.data || [],
      count: response.data.count || 0,
      page: response.data.page || params.page || 1,
      limit: response.data.limit || params.limit || 10,
      totalPages: response.data.totalPages || 0
    };
  } catch (error: any) {
    console.error('Gagal mengambil data janji temu:', error);
    throw new Error(error.response?.data?.message || 'Gagal memuat data janji temu');
  }
};

/**
 * ✅ Mengambil satu data janji temu berdasarkan ID
 * Backend: GET /appointments/:id
 */
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.get(`/appointments/${id}`);
    // Backend returns appointment object directly
    return response.data;
  } catch (error: any) {
    console.error(`Gagal mengambil janji temu dengan ID ${id}:`, error);
    throw new Error(error.response?.data?.message || `Gagal memuat detail janji temu`);
  }
};

/**
 * ✅ FIXED: Membuat janji temu baru
 * Backend: POST /appointments
 */
export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  try {
    // Validasi data sebelum dikirim
    if (!data.patient_id || !data.doctor_id || !data.tanggal_janji || !data.jam_janji) {
      throw new Error('Data janji temu tidak lengkap');
    }

    // Pastikan format jam sesuai (HH:mm:ss)
    const formattedData = {
      ...data,
      jam_janji: data.jam_janji.includes(':00') ? data.jam_janji : `${data.jam_janji}:00`
    };

    const response = await api.post('/appointments', formattedData);
    // Backend returns appointment object directly
    return response.data;
  } catch (error: any) {
    console.error('Gagal membuat janji temu:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat janji temu';
    throw new Error(errorMessage);
  }
};

/**
 * ✅ Mengubah status janji temu menjadi 'selesai'
 * Backend: POST /appointments/:id/complete
 */
export const completeAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.post(`/appointments/${id}/complete`);
    // Backend returns appointment object directly
    return response.data;
  } catch (error: any) {
    console.error(`Gagal menyelesaikan janji temu dengan ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Gagal menyelesaikan janji temu');
  }
};

/**
 * ✅ Mengubah status janji temu menjadi 'dibatalkan'
 * Backend: POST /appointments/:id/cancel
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.post(`/appointments/${id}/cancel`);
    // Backend returns appointment object directly
    return response.data;
  } catch (error: any) {
    console.error(`Gagal membatalkan janji temu dengan ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Gagal membatalkan janji temu');
  }
};

/**
 * ✅ FIXED: Mengupdate data janji temu
 * Backend: PATCH /appointments/:id (bukan PUT!)
 */
export const updateAppointment = async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
  try {
    // Pastikan format jam sesuai jika ada
    if (data.jam_janji && !data.jam_janji.includes(':00')) {
      data.jam_janji = `${data.jam_janji}:00`;
    }

    const response = await api.patch(`/appointments/${id}`, data);
    // Backend returns appointment object directly
    return response.data;
  } catch (error: any) {
    console.error(`Gagal mengupdate janji temu dengan ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Gagal mengupdate janji temu');
  }
};

/**
 * ✅ Menghapus janji temu
 * Backend: DELETE /appointments/:id
 */
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error: any) {
    console.error(`Gagal menghapus janji temu dengan ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Gagal menghapus janji temu');
  }
};