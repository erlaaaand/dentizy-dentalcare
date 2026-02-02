import {
  medicalRecordsControllerCreate,
  medicalRecordsControllerFindAll,
  medicalRecordsControllerSearch,
  medicalRecordsControllerFindByAppointmentId,
  medicalRecordsControllerGetDoctorStats,
  medicalRecordsControllerFindOne,
  medicalRecordsControllerUpdate,
  medicalRecordsControllerRemove,
  medicalRecordsControllerRestore,
  medicalRecordsControllerHardDelete
} from '../../../api/generated/medical-records/medical-records';

import type { 
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams
} from '../../../types/medical-records/medical-record.types';

export const MedicalRecordService = {
  /**
   * Membuat rekam medis baru untuk appointment
   */
  create: async (data: CreateMedicalRecordDto) => {
    const response = await medicalRecordsControllerCreate(data);
    return response;
  },

  /**
   * Mendapatkan daftar semua rekam medis dengan pagination dan filter
   */
  findAll: async (params?: MedicalRecordQueryParams) => {
    const response = await medicalRecordsControllerFindAll(params);
    return response;
  },

  /**
   * Pencarian rekam medis multi-field (SOAP)
   */
  search: async (params: MedicalRecordSearchParams) => {
    const response = await medicalRecordsControllerSearch(params);
    return response;
  },

  /**
   * Mendapatkan rekam medis berdasarkan appointment ID
   */
  findByAppointmentId: async (appointmentId: string) => {
    const response = await medicalRecordsControllerFindByAppointmentId(appointmentId);
    return response;
  },

  /**
   * Mendapatkan statistik kinerja dokter
   */
  getDoctorStats: async (params?: DoctorStatsParams) => {
    const response = await medicalRecordsControllerGetDoctorStats(params);
    return response;
  },

  /**
   * Mendapatkan detail rekam medis berdasarkan ID
   */
  findOne: async (id: string) => {
    const response = await medicalRecordsControllerFindOne(id);
    return response;
  },

  /**
   * Update rekam medis yang sudah ada
   */
  update: async (id: string, data: UpdateMedicalRecordDto) => {
    const response = await medicalRecordsControllerUpdate(id, data);
    return response;
  },

  /**
   * Soft delete rekam medis (hanya KEPALA_KLINIK)
   */
  remove: async (id: string) => {
    const response = await medicalRecordsControllerRemove(id);
    return response;
  },

  /**
   * Restore rekam medis yang di-soft delete (hanya KEPALA_KLINIK)
   */
  restore: async (id: string) => {
    const response = await medicalRecordsControllerRestore(id);
    return response;
  },

  /**
   * Hard delete rekam medis - permanent deletion (hanya KEPALA_KLINIK)
   * PERHATIAN: Aksi ini tidak dapat dibatalkan!
   */
  hardDelete: async (id: string) => {
    const response = await medicalRecordsControllerHardDelete(id);
    return response;
  }
};