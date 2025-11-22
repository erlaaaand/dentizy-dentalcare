// frontend/src/core/validators/medicalRecordSchema.ts
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '@/core/api/model';

/**
 * Validate medical record form (SOAP notes)
 */
export function validateMedicalRecordForm(
  data: Partial<CreateMedicalRecordDto | UpdateMedicalRecordDto>
): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Subjective validation
  if (!data.subjektif?.trim()) {
    errors.subjektif = 'Subjektif (keluhan pasien) harus diisi';
  } else if (data.subjektif.trim().length < 10) {
    errors.subjektif = 'Subjektif minimal 10 karakter';
  } else if (data.subjektif.trim().length > 5000) {
    errors.subjektif = 'Subjektif maksimal 5000 karakter';
  }

  // Objective validation
  if (!data.objektif?.trim()) {
    errors.objektif = 'Objektif (hasil pemeriksaan) harus diisi';
  } else if (data.objektif.trim().length < 10) {
    errors.objektif = 'Objektif minimal 10 karakter';
  } else if (data.objektif.trim().length > 5000) {
    errors.objektif = 'Objektif maksimal 5000 karakter';
  }

  // Assessment validation
  if (!data.assessment?.trim()) {
    errors.assessment = 'Assessment (diagnosis) harus diisi';
  } else if (data.assessment.trim().length < 5) {
    errors.assessment = 'Assessment minimal 5 karakter';
  } else if (data.assessment.trim().length > 5000) {
    errors.assessment = 'Assessment maksimal 5000 karakter';
  }

  // Plan validation
  if (!data.plan?.trim()) {
    errors.plan = 'Plan (rencana perawatan) harus diisi';
  } else if (data.plan.trim().length < 10) {
    errors.plan = 'Plan minimal 10 karakter';
  } else if (data.plan.trim().length > 5000) {
    errors.plan = 'Plan maksimal 5000 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate SOAP notes (partial - for drafts)
 */
export function validateSOAPNotes(
  data: Partial<CreateMedicalRecordDto | UpdateMedicalRecordDto>
): {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const fields = ['subjektif', 'objektif', 'assessment', 'plan'];
  const missingFields: string[] = [];
  let filledFields = 0;

  fields.forEach(field => {
    const value = data[field as keyof typeof data];
    if (value && typeof value === 'string' && value.trim()) {
      filledFields++;
    } else {
      missingFields.push(field);
    }
  });

  return {
    isComplete: filledFields === fields.length,
    completionPercentage: Math.round((filledFields / fields.length) * 100),
    missingFields,
  };
}

/**
 * Sanitize medical record form data
 */
export function sanitizeMedicalRecordFormData(
  data: Partial<CreateMedicalRecordDto | UpdateMedicalRecordDto>
): Partial<CreateMedicalRecordDto | UpdateMedicalRecordDto> {
  const sanitized: Partial<CreateMedicalRecordDto | UpdateMedicalRecordDto> = {
    subjektif: data.subjektif?.trim() || undefined,
    objektif: data.objektif?.trim() || undefined,
    assessment: data.assessment?.trim() || undefined,
    plan: data.plan?.trim() || undefined,
  };

  // Add appointment_id and user_id_staff only for CreateMedicalRecordDto
  if ('appointment_id' in data && data.appointment_id) {
    (sanitized as CreateMedicalRecordDto).appointment_id = data.appointment_id;
  }
  if ('user_id_staff' in data && data.user_id_staff) {
    (sanitized as CreateMedicalRecordDto).user_id_staff = data.user_id_staff;
  }

  return sanitized;
}