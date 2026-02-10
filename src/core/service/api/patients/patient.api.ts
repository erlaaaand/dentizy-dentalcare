import { BaseService } from '../../base/base.service';
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
  patientsControllerRestore,
} from '../../../api/generated/patients/patients';

import type {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams,
  Patient,
  PatientPaginatedResponse,
  PatientStatistics
} from '../../../types/patients/patient.types';

/**
 * Patients Service
 * Handles all patient-related API calls
 * Extends BaseService for common query operations
 */
export class PatientsService extends BaseService {
  /**
   * Get all patients with pagination
   */
  async findAll(params?: PatientQueryParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerFindAll(params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  /**
   * Get single patient by ID
   */
  async findOne(id: string): Promise<Patient> {
    const response = await patientsControllerFindOne(id);
    return response.data as Patient;
  }

  /**
   * Search patients
   */
  async search(params?: PatientSearchParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerSearch(params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  /**
   * Get patient statistics
   */
  async getStatistics(): Promise<PatientStatistics> {
    const response = await patientsControllerGetStatistics();
    return response.data as PatientStatistics;
  }

  /**
   * Find patient by medical record number
   */
  async findByMedicalRecordNumber(number: string): Promise<Patient> {
    const response = await patientsControllerFindByMedicalRecordNumber(number);
    return response.data as Patient;
  }

  /**
   * Find patient by NIK
   */
  async findByNik(nik: string): Promise<Patient> {
    const response = await patientsControllerFindByNik(nik);
    return response.data as Patient;
  }

  /**
   * Find patients by doctor
   */
  async findByDoctor(doctorId: string, params?: PatientByDoctorParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerFindByDoctor(doctorId, params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  /**
   * Create new patient
   */
  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await patientsControllerCreate(data);
    if (response.status === 201) {
      return response.data as Patient;
    }
    throw new Error('Failed to create patient');
  }

  /**
   * Update patient
   */
  async update(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await patientsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to update patient');
  }

  /**
   * Soft delete patient
   */
  async remove(id: string): Promise<void> {
    const response = await patientsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove patient');
    }
  }

  /**
   * Activate patient
   */
  async activate(id: string): Promise<Patient> {
    const response = await patientsControllerActivatePatient(id);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to activate patient');
  }

  /**
   * Restore soft-deleted patient
   */
  async restore(id: string): Promise<Patient> {
    const response = await patientsControllerRestore(id);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to restore patient');
  }
}

export const patientsService = new PatientsService();