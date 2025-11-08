import { AppointmentStatus, ID } from '@/types/api';
import { isPastDate, isPastTime } from '@/lib/formatters/scheduleFormatter';

export interface AppointmentFormData {
  patient_id: ID | string;
  doctor_id: ID | string;
  tanggal_janji: string;
  jam_janji: string;
  keluhan?: string;
  status?: AppointmentStatus;
}

/**
 * Validate appointment form
 */
export function validateAppointmentForm(data: AppointmentFormData, isEdit: boolean = false): { 
  isValid: boolean; 
  errors: Partial<Record<keyof AppointmentFormData, string>> 
} {
  const errors: Partial<Record<keyof AppointmentFormData, string>> = {};
  
  // Patient validation
  if (!data.patient_id) {
    errors.patient_id = 'Pasien harus dipilih';
  }
  
  // Doctor validation
  if (!data.doctor_id) {
    errors.doctor_id = 'Dokter harus dipilih';
  }
  
  // Date validation
  if (!data.tanggal_janji) {
    errors.tanggal_janji = 'Tanggal janji harus diisi';
  } else if (!isEdit && isPastDate(data.tanggal_janji)) {
    errors.tanggal_janji = 'Tanggal janji tidak boleh di masa lalu';
  }
  
  // Time validation
  if (!data.jam_janji) {
    errors.jam_janji = 'Jam janji harus diisi';
  } else if (!isEdit && data.tanggal_janji && isPastTime(data.tanggal_janji, data.jam_janji)) {
    errors.jam_janji = 'Waktu janji tidak boleh di masa lalu';
  }
  
  // Complaint validation (optional but recommended)
  if (data.keluhan && data.keluhan.trim().length > 500) {
    errors.keluhan = 'Keluhan maksimal 500 karakter';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize appointment form data
 */
export function sanitizeAppointmentFormData(data: AppointmentFormData): AppointmentFormData {
  return {
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    tanggal_janji: data.tanggal_janji,
    jam_janji: data.jam_janji,
    keluhan: data.keluhan?.trim() || undefined,
    status: data.status || AppointmentStatus.DIJADWALKAN,
  };
}