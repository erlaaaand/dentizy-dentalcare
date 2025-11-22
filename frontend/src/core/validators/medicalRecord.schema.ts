// frontend/src/core/validators/medicalRecord.schema.ts

interface MedicalRecordFormData {
  appointment_id?: number;
  user_id_staff?: number;
  subjektif?: string | null;
  objektif?: string | null;
  assessment?: string | null;
  plan?: string | null;
}

export function validateMedicalRecordForm(data: Partial<MedicalRecordFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.subjektif?.trim()) {
    errors.subjektif = 'Subjektif harus diisi';
  } else if (data.subjektif.trim().length < 10) {
    errors.subjektif = 'Subjektif minimal 10 karakter';
  } else if (data.subjektif.trim().length > 5000) {
    errors.subjektif = 'Subjektif maksimal 5000 karakter';
  }

  if (!data.objektif?.trim()) {
    errors.objektif = 'Objektif harus diisi';
  } else if (data.objektif.trim().length < 10) {
    errors.objektif = 'Objektif minimal 10 karakter';
  } else if (data.objektif.trim().length > 5000) {
    errors.objektif = 'Objektif maksimal 5000 karakter';
  }

  if (!data.assessment?.trim()) {
    errors.assessment = 'Assessment harus diisi';
  } else if (data.assessment.trim().length < 5) {
    errors.assessment = 'Assessment minimal 5 karakter';
  } else if (data.assessment.trim().length > 5000) {
    errors.assessment = 'Assessment maksimal 5000 karakter';
  }

  if (!data.plan?.trim()) {
    errors.plan = 'Plan harus diisi';
  } else if (data.plan.trim().length < 10) {
    errors.plan = 'Plan minimal 10 karakter';
  } else if (data.plan.trim().length > 5000) {
    errors.plan = 'Plan maksimal 5000 karakter';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSOAPNotes(data: Partial<MedicalRecordFormData>): {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const fields = ['subjektif', 'objektif', 'assessment', 'plan'] as const;
  const missingFields: string[] = [];
  let filledFields = 0;

  fields.forEach((field) => {
    const value = data[field];
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

export function sanitizeMedicalRecordFormData(data: Partial<MedicalRecordFormData>): Partial<MedicalRecordFormData> {
  const sanitized: Partial<MedicalRecordFormData> = {
    subjektif: data.subjektif?.trim() || undefined,
    objektif: data.objektif?.trim() || undefined,
    assessment: data.assessment?.trim() || undefined,
    plan: data.plan?.trim() || undefined,
  };

  if (data.appointment_id) {
    sanitized.appointment_id = data.appointment_id;
  }
  if (data.user_id_staff) {
    sanitized.user_id_staff = data.user_id_staff;
  }

  return sanitized;
}