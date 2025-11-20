import { MedicalRecord } from '@/core/types/api';

/**
 * Format medical record number
 */
export function formatMedicalRecordNumber(number: string | null | undefined): string {
  if (!number) return '-';

  // Format: MR-YYYYMMDD-XXXX
  if (number.length >= 16) {
    return `${number.substring(0, 2)}-${number.substring(2, 10)}-${number.substring(10)}`;
  }

  return number;
}

/**
 * Generate medical record number
 * Format: MRYYYYMMDDXXXX (MR + Date + Sequential)
 */
export function generateMedicalRecordNumber(sequential: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(sequential).padStart(4, '0');

  return `MR${year}${month}${day}${seq}`;
}

/**
 * Format SOAP notes for display
 */
export function formatSOAPNotes(record: MedicalRecord | null | undefined): {
  subjektif: string;
  objektif: string;
  assessment: string;
  plan: string;
} {
  if (!record) {
    return {
      subjektif: '-',
      objektif: '-',
      assessment: '-',
      plan: '-',
    };
  }

  return {
    subjektif: record.subjektif || '-',
    objektif: record.objektif || '-',
    assessment: record.assessment || '-',
    plan: record.plan || '-',
  };
}

/**
 * Check if medical record is complete
 */
export function isMedicalRecordComplete(record: MedicalRecord | null | undefined): boolean {
  if (!record) return false;

  return !!(
    record.subjektif &&
    record.objektif &&
    record.assessment &&
    record.plan
  );
}

/**
 * Get completion percentage
 */
export function getMedicalRecordCompletion(record: MedicalRecord | null | undefined): number {
  if (!record) return 0;

  let completed = 0;
  const total = 4;

  if (record.subjektif) completed++;
  if (record.objektif) completed++;
  if (record.assessment) completed++;
  if (record.plan) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Format SOAP section for printing
 */
export function formatSOAPSection(title: string, content: string | null | undefined): string {
  if (!content) return `${title}:\n-\n\n`;

  return `${title}:\n${content}\n\n`;
}

/**
 * Export medical record to plain text
 */
export function exportMedicalRecordToText(record: MedicalRecord): string {
  const soap = formatSOAPNotes(record);

  return `
REKAM MEDIS PASIEN

Nomor RM: ${record.patient.no_rm}
Nama Pasien: ${record.patient.nama_lengkap}
Tanggal Janji: ${record.appointment.appointment_date}
Dokter: ${record.doctor_id}

${formatSOAPSection('SUBJEKTIF (Keluhan Pasien)', soap.subjektif)}
${formatSOAPSection('OBJEKTIF (Hasil Pemeriksaan)', soap.objektif)}
${formatSOAPSection('ASSESSMENT (Diagnosis)', soap.assessment)}
${formatSOAPSection('PLAN (Rencana Perawatan)', soap.plan)}

Dibuat pada: ${record.created_at}
  `.trim();
}

/**
 * Validate SOAP data
 */
export function validateSOAPData(data: {
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.subjektif?.trim()) {
    errors.push('Subjektif (keluhan pasien) harus diisi');
  }

  if (!data.objektif?.trim()) {
    errors.push('Objektif (hasil pemeriksaan) harus diisi');
  }

  if (!data.assessment?.trim()) {
    errors.push('Assessment (diagnosis) harus diisi');
  }

  if (!data.plan?.trim()) {
    errors.push('Plan (rencana perawatan) harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}