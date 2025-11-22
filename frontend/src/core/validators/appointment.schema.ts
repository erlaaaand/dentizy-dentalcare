// frontend/src/core/validators/appointment.schema.ts
import { isPastDate, isPastTime } from '@/core/formatters/schedule.formatter';

interface AppointmentFormData {
  patient_id?: number;
  doctor_id?: number;
  tanggal_janji?: string;
  jam_janji?: string;
  keluhan?: string;
  status?: string;
}

export function validateAppointmentForm(
  data: Partial<AppointmentFormData>,
  isEdit: boolean = false
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.patient_id) {
    errors.patient_id = 'Pasien harus dipilih';
  }

  if (!data.doctor_id) {
    errors.doctor_id = 'Dokter harus dipilih';
  }

  if (!data.tanggal_janji) {
    errors.tanggal_janji = 'Tanggal janji harus diisi';
  } else if (!isEdit && isPastDate(data.tanggal_janji)) {
    errors.tanggal_janji = 'Tanggal janji tidak boleh di masa lalu';
  }

  if (!data.jam_janji) {
    errors.jam_janji = 'Jam janji harus diisi';
  } else if (!isEdit && data.tanggal_janji && isPastTime(data.tanggal_janji, data.jam_janji)) {
    errors.jam_janji = 'Waktu janji tidak boleh di masa lalu';
  }

  if (data.keluhan && data.keluhan.trim().length > 500) {
    errors.keluhan = 'Keluhan maksimal 500 karakter';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function sanitizeAppointmentFormData(data: Partial<AppointmentFormData>): Partial<AppointmentFormData> {
  return {
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    tanggal_janji: data.tanggal_janji,
    jam_janji: data.jam_janji,
    keluhan: data.keluhan?.trim() || undefined,
    status: data.status || 'dijadwalkan',
  };
}