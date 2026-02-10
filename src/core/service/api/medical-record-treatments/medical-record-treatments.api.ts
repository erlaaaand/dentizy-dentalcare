import { BaseService } from '../../base/base.service';
import {
  medicalRecordTreatmentsControllerFindAll,
  medicalRecordTreatmentsControllerCreate,
  medicalRecordTreatmentsControllerUpdate,
  medicalRecordTreatmentsControllerRemove,
  medicalRecordTreatmentsControllerFindOne,
  medicalRecordTreatmentsControllerFindByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTotalByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTopTreatments,
} from '../../../api/generated/medical-record-treatments/medical-record-treatments';

import type {
  CreateMedicalRecordTreatmentDto,
  UpdateMedicalRecordTreatmentDto,
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams,
  MedicalRecordTreatment,
  TreatmentTotalResponse,
} from '../../../types/medical-record-treatments/medical-record-treatments.types';

export class MedicalRecordTreatmentsService extends BaseService {
  
  // ==================== QUERIES ====================
  
  /**
   * Mengambil semua data tindakan rekam medis dengan filter optional
   */
  async findAll(params?: MedicalRecordTreatmentQueryParams): Promise<MedicalRecordTreatment[]> {
    const response = await medicalRecordTreatmentsControllerFindAll(params);
    if (response.status === 200) {
        return response.data as MedicalRecordTreatment[];
    }
    return [];
  }

  /**
   * Mengambil satu detail tindakan berdasarkan ID
   */
  async findOne(id: string): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerFindOne(id);
    if (response.status === 200) {
        return response.data as MedicalRecordTreatment;
    }
    throw new Error(`Tindakan dengan ID ${id} tidak ditemukan`);
  }

  /**
   * Mencari daftar tindakan berdasarkan ID Rekam Medis tertentu
   */
  async findByMedicalRecordId(medicalRecordId: string): Promise<MedicalRecordTreatment[]> {
    const response = await medicalRecordTreatmentsControllerFindByMedicalRecordId(medicalRecordId);
    if (response.status === 200) {
        return response.data as MedicalRecordTreatment[];
    }
    return [];
  }

  /**
   * Mengambil ringkasan total biaya untuk satu rekam medis
   */
  async getTotalByMedicalRecordId(medicalRecordId: string): Promise<TreatmentTotalResponse> {
    const response = await medicalRecordTreatmentsControllerGetTotalByMedicalRecordId(medicalRecordId);
    if (response.status === 200) {
        return response.data as TreatmentTotalResponse;
    }
    throw new Error('Gagal mengambil total biaya tindakan');
  }

  /**
   * Mengambil daftar tindakan yang paling sering dilakukan berdasarkan parameter tertentu
   */
  async getTopTreatments(params?: TopTreatmentsParams): Promise<MedicalRecordTreatment[]> {
    const response = await medicalRecordTreatmentsControllerGetTopTreatments(params);
    if (response.status === 200) {
      const data = response.data as unknown;
      return data as MedicalRecordTreatment[];
    }
    return [];
  }

  // ==================== MUTATIONS ====================
  
  /**
   * Membuat tindakan rekam medis baru
   */
  async create(data: CreateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerCreate(data);
    if (response.status === 201) {
      return response.data as MedicalRecordTreatment;
    }
    throw new Error('Gagal menambahkan tindakan rekam medis');
  }

  /**
   * Memperbarui data tindakan rekam medis yang sudah ada
   */
  async update(id: string, data: UpdateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as MedicalRecordTreatment;
    }
    throw new Error('Gagal memperbarui tindakan rekam medis');
  }

  /**
   * Menghapus tindakan rekam medis
   */
  async remove(id: string): Promise<{ statusCode: number; message: string }> {
    const response = await medicalRecordTreatmentsControllerRemove(id);
    
    const status = response.status as number;

    if (status === 200) {
      return response.data as { statusCode: number; message: string };
    }

    throw new Error('Gagal menghapus tindakan rekam medis');
  }
}

export const medicalRecordTreatmentsService = new MedicalRecordTreatmentsService();