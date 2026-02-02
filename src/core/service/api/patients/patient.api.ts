import {
  patientsControllerCreate,
  patientsControllerFindAll,
  patientsControllerSearch,
  patientsControllerGetStatistics,
  patientsControllerFindByMedicalRecordNumber,
  patientsControllerFindByNik,
  patientsControllerFindByDoctor,
  patientsControllerFindOne,
  patientsControllerUpdate,
  patientsControllerRemove,
  patientsControllerActivatePatient,
  patientsControllerRestore
} from '../../../api/generated/patients/patients';

import type {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams
} from '../../../types/patients/patient.types';

export const PatientService = {
  /**
   * Membuat pasien baru (hanya STAF dan KEPALA_KLINIK)
   */
  create: async (data: CreatePatientDto) => {
    const response = await patientsControllerCreate(data);
    return response;
  },

  /**
   * Mendapatkan daftar semua pasien dengan pagination dan filter
   */
  findAll: async (params?: PatientQueryParams) => {
    const response = await patientsControllerFindAll(params);
    return response;
  },

  /**
   * Pencarian real-time pasien multi-field
   */
  search: async (params?: PatientSearchParams) => {
    const response = await patientsControllerSearch(params);
    return response;
  },

  /**
   * Mendapatkan statistik pasien untuk dashboard
   */
  getStatistics: async () => {
    const response = await patientsControllerGetStatistics();
    return response;
  },

  /**
   * Mencari pasien berdasarkan nomor rekam medis
   */
  findByMedicalRecordNumber: async (number: string) => {
    const response = await patientsControllerFindByMedicalRecordNumber(number);
    return response;
  },

  /**
   * Mencari pasien berdasarkan NIK
   */
  findByNik: async (nik: string) => {
    const response = await patientsControllerFindByNik(nik);
    return response;
  },

  /**
   * Mendapatkan daftar pasien per dokter gigi
   */
  findByDoctor: async (doctorId: string, params?: PatientByDoctorParams) => {
    const response = await patientsControllerFindByDoctor(doctorId, params);
    return response;
  },

  /**
   * Mendapatkan detail pasien berdasarkan ID
   */
  findOne: async (id: string) => {
    const response = await patientsControllerFindOne(id);
    return response;
  },

  /**
   * Update data pasien (hanya STAF dan KEPALA_KLINIK)
   */
  update: async (id: string, data: UpdatePatientDto) => {
    const response = await patientsControllerUpdate(id, data);
    return response;
  },

  /**
   * Soft delete pasien (hanya KEPALA_KLINIK)
   */
  remove: async (id: string) => {
    const response = await patientsControllerRemove(id);
    return response;
  },

  /**
   * Verifikasi & aktifkan pasien dari pendaftaran online
   */
  activate: async (id: string) => {
    const response = await patientsControllerActivatePatient(id);
    return response;
  },

  /**
   * Restore pasien yang di-soft delete (hanya KEPALA_KLINIK)
   */
  restore: async (id: string) => {
    const response = await patientsControllerRestore(id);
    return response;
  }
};