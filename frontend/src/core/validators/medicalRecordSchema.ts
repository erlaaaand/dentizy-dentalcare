import { ID } from '@/core/types/api';

export interface MedicalRecordFormData {
  appointment_id: ID;
  user_id_staff: ID;
  subjektif: string;
  objektif: string;
  assessment: string;
  plan: string;
}

/**
 * Validate medical record form (SOAP notes)
 */
export function validateMedicalRecordForm(data: Partial<MedicalRecordFormData>): { 
  isValid: boolean; 
  errors: Partial<Record<keyof MedicalRecordFormData, string>> 
} {
  const errors: Partial<Record<keyof MedicalRecordFormData, string>> = {};
  
  // Subjective validation
  if (!data.subjektif?.trim()) {
    errors.subjektif = 'Subjektif (keluhan pasien) harus diisi';
  } else if (data.subjektif.trim().length < 10) {
    errors.subjektif = 'Subjektif minimal 10 karakter';
  }
  
  // Objective validation
  if (!data.objektif?.trim()) {
    errors.objektif = 'Objektif (hasil pemeriksaan) harus diisi';
  } else if (data.objektif.trim().length < 10) {
    errors.objektif = 'Objektif minimal 10 karakter';
  }
  
  // Assessment validation
  if (!data.assessment?.trim()) {
    errors.assessment = 'Assessment (diagnosis) harus diisi';
  } else if (data.assessment.trim().length < 5) {
    errors.assessment = 'Assessment minimal 5 karakter';
  }
  
  // Plan validation
  if (!data.plan?.trim()) {
    errors.plan = 'Plan (rencana perawatan) harus diisi';
  } else if (data.plan.trim().length < 10) {
    errors.plan = 'Plan minimal 10 karakter';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate SOAP notes (partial - for drafts)
 */
export function validateSOAPNotes(data: Partial<MedicalRecordFormData>): { 
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
} {
  const fields = ['subjektif', 'objektif', 'assessment', 'plan'];
  const missingFields: string[] = [];
  let filledFields = 0;
  
  fields.forEach(field => {
    const value = data[field as keyof MedicalRecordFormData];
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
export function sanitizeMedicalRecordFormData(data: Partial<MedicalRecordFormData>): Partial<MedicalRecordFormData> {
  return {
    appointment_id: data.appointment_id,
    user_id_staff: data.user_id_staff,
    subjektif: data.subjektif?.trim() || '',
    objektif: data.objektif?.trim() || '',
    assessment: data.assessment?.trim() || '',
    plan: data.plan?.trim() || '',
  };
}