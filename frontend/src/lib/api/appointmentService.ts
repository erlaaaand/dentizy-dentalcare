import api from './axiosInstance';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '@/types/api';

// --- Tipe Data DTO ---
interface FindAppointmentsQuery {
  doctor_id?: number | string;
  date?: string;
  status?: 'dijadwalkan' | 'selesai' | 'dibatalkan' | '';
  page?: number;
  limit?: number;
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
 * ✅ SECURED: Mengambil daftar janji temu dengan filter
 * Backend structure: { data, count, page, limit, totalPages }
 */
export const getAppointments = async (params: FindAppointmentsQuery = {}): Promise<PaginatedAppointments> => {
  try {
    // ✅ Buat objek baru untuk menampung parameter yang valid
    const cleanParams: { [key: string]: any } = {};

    // ✅ Hanya tambahkan parameter yang memiliki nilai valid
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Konversi doctorId menjadi number jika berupa string
        if (key === 'doctor_id' && typeof value === 'string') {
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

    // ✅ Validasi response structure
    if (!response.data) {
      throw new Error('Invalid response structure from server');
    }

    return {
      data: response.data.data || [],
      count: response.data.count || 0,
      page: response.data.page || params.page || 1,
      limit: response.data.limit || params.limit || 10,
      totalPages: response.data.totalPages || 0
    };
  } catch (error: any) {
    console.error('Gagal mengambil data janji temu:', error);

    // ✅ Enhanced error handling
    if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki akses untuk melihat janji temu');
    } else if (error.response?.status === 401) {
      throw new Error('Sesi Anda telah berakhir. Silakan login kembali');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw error;
    }

    throw new Error('Gagal memuat data janji temu');
  }
};

/**
 * ✅ SECURED: Mengambil satu data janji temu berdasarkan ID
 * Backend: GET /appointments/:id
 */
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    // ✅ Validasi ID
    if (!id || id <= 0) {
      throw new Error('ID janji temu tidak valid');
    }

    const response = await api.get(`/appointments/${id}`);

    // ✅ Validasi response
    if (!response.data) {
      throw new Error('Data janji temu tidak ditemukan');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Gagal mengambil janji temu dengan ID ${id}:`, error);

    if (error.response?.status === 404) {
      throw new Error(`Janji temu dengan ID ${id} tidak ditemukan`);
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki akses ke janji temu ini');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw error;
    }

    throw new Error('Gagal memuat detail janji temu');
  }
};

/**
 * ✅ SECURED: Membuat janji temu baru
 * Backend: POST /appointments
 */
export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  try {
    // ✅ Validasi data
    if (!data.patient_id || data.patient_id <= 0) {
      throw new Error('Patient ID tidak valid');
    }

    if (!data.doctor_id || data.doctor_id <= 0) {
      throw new Error('Doctor ID tidak valid');
    }

    if (!data.tanggal_janji || data.tanggal_janji.trim() === '') {
      throw new Error('Tanggal janji harus diisi');
    }

    if (!data.jam_janji || data.jam_janji.trim() === '') {
      throw new Error('Jam janji harus diisi');
    }

    // ✅ Validasi format tanggal (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal_janji)) {
      throw new Error('Format tanggal tidak valid (gunakan YYYY-MM-DD)');
    }

    // ✅ Validasi tanggal tidak di masa lalu
    const appointmentDate = new Date(data.tanggal_janji);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      throw new Error('Tanggal janji tidak boleh di masa lalu');
    }

    // ✅ Validasi format jam (HH:mm atau HH:mm:ss)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(data.jam_janji)) {
      throw new Error('Format jam tidak valid (gunakan HH:mm atau HH:mm:ss)');
    }

    // ✅ Pastikan format jam sesuai (HH:mm:ss)
    const formattedData = {
      ...data,
      tanggal_janji: data.tanggal_janji.trim(),
      jam_janji: data.jam_janji.includes(':00') ? data.jam_janji : `${data.jam_janji}:00`,
      keluhan: data.keluhan?.trim()
    };

    const response = await api.post('/appointments', formattedData);

    // ✅ Validasi response
    if (!response.data) {
      throw new Error('Gagal membuat janji temu');
    }

    return response.data;
  } catch (error: any) {
    console.error('Gagal membuat janji temu:', error);

    if (error.response?.status === 404) {
      throw new Error('Pasien atau dokter tidak ditemukan');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.message || 'Jadwal bentrok dengan janji temu lain');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Data tidak valid');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw error;
    }

    throw new Error('Gagal membuat janji temu');
  }
};

/**
 * ✅ SECURED: Mengubah status janji temu menjadi 'selesai'
 * Backend: POST /appointments/:id/complete
 */
export const completeAppointment = async (id: number): Promise<Appointment> => {
  try {
    // ✅ Validasi ID
    if (!id || id <= 0) {
      throw new Error('ID janji temu tidak valid');
    }

    const response = await api.post(`/appointments/${id}/complete`);

    // ✅ Validasi response
    if (!response.data) {
      throw new Error('Gagal menyelesaikan janji temu');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Gagal menyelesaikan janji temu dengan ID ${id}:`, error);

    if (error.response?.status === 404) {
      throw new Error(`Janji temu dengan ID ${id} tidak ditemukan`);
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki akses untuk menyelesaikan janji temu ini');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.message || 'Status janji temu tidak valid');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Gagal menyelesaikan janji temu');
  }
};

/**
 * ✅ SECURED: Mengubah status janji temu menjadi 'dibatalkan'
 * Backend: POST /appointments/:id/cancel
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  try {
    // ✅ Validasi ID
    if (!id || id <= 0) {
      throw new Error('ID janji temu tidak valid');
    }

    const response = await api.post(`/appointments/${id}/cancel`);

    // ✅ Validasi response
    if (!response.data) {
      throw new Error('Gagal membatalkan janji temu');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Gagal membatalkan janji temu dengan ID ${id}:`, error);

    if (error.response?.status === 404) {
      throw new Error(`Janji temu dengan ID ${id} tidak ditemukan`);
    } else if (error.response?.status === 403) {
      throw new Error(error.response.data?.message || 'Anda tidak memiliki akses untuk membatalkan janji temu ini');
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.message || 'Status janji temu tidak valid untuk dibatalkan');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Gagal membatalkan janji temu');
  }
};

/**
 * ✅ SECURED: Mengupdate data janji temu
 * Backend: PATCH /appointments/:id (bukan PUT!)
 */
export const updateAppointment = async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
  try {
    // ✅ Validasi ID
    if (!id || id <= 0) {
      throw new Error('ID janji temu tidak valid');
    }

    // ✅ Validasi tanggal jika diubah
    if (data.tanggal_janji) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal_janji)) {
        throw new Error('Format tanggal tidak valid (gunakan YYYY-MM-DD)');
      }

      const appointmentDate = new Date(data.tanggal_janji);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        throw new Error('Tanggal janji tidak boleh di masa lalu');
      }
    }

    // ✅ Validasi format jam jika diubah
    if (data.jam_janji) {
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(data.jam_janji)) {
        throw new Error('Format jam tidak valid');
      }

      // Pastikan format HH:mm:ss
      if (!data.jam_janji.includes(':00')) {
        data.jam_janji = `${data.jam_janji}:00`;
      }
    }

    // ✅ Clean data
    const cleanedData: UpdateAppointmentDto = {};
    if (data.tanggal_janji) cleanedData.tanggal_janji = data.tanggal_janji.trim();
    if (data.jam_janji) cleanedData.jam_janji = data.jam_janji;
    if (data.status) cleanedData.status = data.status;
    if (data.keluhan !== undefined) cleanedData.keluhan = data.keluhan?.trim();

    const response = await api.patch(`/appointments/${id}`, cleanedData);

    // ✅ Validasi response
    if (!response.data) {
      throw new Error('Gagal mengupdate janji temu');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Gagal mengupdate janji temu dengan ID ${id}:`, error);

    if (error.response?.status === 404) {
      throw new Error(`Janji temu dengan ID ${id} tidak ditemukan`);
    } else if (error.response?.status === 409) {
      throw new Error(error.response.data?.message || 'Status janji temu tidak valid untuk diubah');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Data tidak valid');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw error;
    }

    throw new Error('Gagal mengupdate janji temu');
  }
};

/**
 * ✅ SECURED: Menghapus janji temu
 * Backend: DELETE /appointments/:id
 */
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    // ✅ Validasi ID
    if (!id || id <= 0) {
      throw new Error('ID janji temu tidak valid');
    }

    await api.delete(`/appointments/${id}`);
  } catch (error: any) {
    console.error(`Gagal menghapus janji temu dengan ID ${id}:`, error);

    if (error.response?.status === 404) {
      throw new Error(`Janji temu dengan ID ${id} tidak ditemukan`);
    } else if (error.response?.status === 409) {
      throw new Error('Tidak dapat menghapus janji temu yang sudah memiliki rekam medis');
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki akses untuk menghapus janji temu ini');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Gagal menghapus janji temu');
  }
};