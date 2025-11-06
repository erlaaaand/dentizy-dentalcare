import api from './axiosInstance';

// --- Tipe Data (DTO) ---
interface CreatePatientDto {
  nama_lengkap: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
}

interface UpdatePatientDto {
  nama_lengkap?: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
}

interface SearchPatientDto {
  search?: string;
  page?: number;
  limit?: number;
}

// ✅ Tipe response dari backend (dengan pagination)
interface PaginatedPatientsResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Fungsi-fungsi API ---

/**
 * Mengambil semua data pasien dari backend (dengan pagination).
 */
export const getAllPatients = async (params?: SearchPatientDto): Promise<PaginatedPatientsResponse> => {
  try {
    const response = await api.get('/patients', { params });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data pasien:', error);
    throw error;
  }
};

/**
 * Search pasien dengan keyword
 */
export const searchPatients = async (params: SearchPatientDto): Promise<PaginatedPatientsResponse> => {
  try {
    const response = await api.get('/patients/search', { params });
    return response.data;
  } catch (error) {
    console.error('Gagal mencari pasien:', error);
    throw error;
  }
};

/**
 * Mengambil satu data pasien berdasarkan ID.
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
 * Mengambil pasien berdasarkan nomor rekam medis
 */
export const getPatientByMedicalRecord = async (number: string) => {
  try {
    const response = await api.get(`/patients/by-medical-record/${number}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil pasien dengan no RM ${number}:`, error);
    throw error;
  }
};

/**
 * Mengambil pasien berdasarkan NIK
 */
export const getPatientByNik = async (nik: string) => {
  try {
    const response = await api.get(`/patients/by-nik/${nik}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil pasien dengan NIK ${nik}:`, error);
    throw error;
  }
};

/**
 * Mendaftarkan pasien baru ke sistem.
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