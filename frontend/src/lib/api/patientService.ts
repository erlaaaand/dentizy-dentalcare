import api from './axiosInstance';

// --- Tipe Data (DTO) ---
// Mencerminkan DTO di backend untuk konsistensi data

interface CreatePatientDto {
  nama_lengkap: string;
  nik?: string;
  email?: string;
  // Tambahkan properti lain jika ada, misal: tanggal_lahir, alamat
}

interface UpdatePatientDto {
  nama_lengkap?: string;
  nik?: string;
  email?: string;
}

// --- Fungsi-fungsi API ---

/**
 * Mengambil semua data pasien dari backend.
 */
export const getAllPatients = async () => {
  try {
    const response = await api.get('/patients');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data pasien:', error);
    throw error;
  }
};

/**
 * Mengambil satu data pasien berdasarkan ID.
 * @param id - ID dari pasien.
 */
export const getPatientById = async (id: number) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data pasien dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Mendaftarkan pasien baru ke sistem.
 * @param data - Data untuk pasien baru.
 */
export const createPatient = async (data: CreatePatientDto) => {
  try {
    const response = await api.post('/patients', data);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat pasien baru:', error);
    throw error;
  }
};

/**
 * Mengupdate data pasien yang sudah ada.
 * @param id - ID pasien yang akan diupdate.
 * @param data - Data yang akan diubah.
 */
export const updatePatient = async (id: number, data: UpdatePatientDto) => {
  try {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengupdate pasien dengan ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menghapus data pasien dari sistem.
 * @param id - ID pasien yang akan dihapus.
 */
export const deletePatient = async (id: number) => {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal menghapus pasien dengan ID ${id}:`, error);
    throw error;
  }
};