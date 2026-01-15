// frontend/src/core/formatters/medicalRecord.formatter.ts
import type { MedicalRecordResponseDto } from '@/core/api/model';

export function formatMedicalRecordNumber(number: string | null | undefined): string {
  if (!number) return '-';
  if (number.length >= 16) {
    return `${number.substring(0, 2)}-${number.substring(2, 10)}-${number.substring(10)}`;
  }
  return number;
}

export function generateMedicalRecordNumber(sequential: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(sequential).padStart(4, '0');
  return `MR${year}${month}${day}${seq}`;
}

function jsonToString(value: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export function formatSOAPNotes(record: MedicalRecordResponseDto | null | undefined): {
  subjektif: string;
  objektif: string;
  assessment: string;
  plan: string;
} {
  if (!record) {
    return { subjektif: '-', objektif: '-', assessment: '-', plan: '-' };
  }
  return {
    subjektif: jsonToString(record.subjektif),
    objektif: jsonToString(record.objektif),
    assessment: jsonToString(record.assessment),
    plan: jsonToString(record.plan),
  };
}

export function isMedicalRecordComplete(record: MedicalRecordResponseDto | null | undefined): boolean {
  if (!record) return false;
  return !!(record.subjektif && record.objektif && record.assessment && record.plan);
}

export function getMedicalRecordCompletion(record: MedicalRecordResponseDto | null | undefined): number {
  if (!record) return 0;
  let completed = 0;
  if (record.subjektif) completed++;
  if (record.objektif) completed++;
  if (record.assessment) completed++;
  if (record.plan) completed++;
  return Math.round((completed / 4) * 100);
}

export function formatSOAPSection(title: string, content: unknown): string {
  if (!content) return `${title}:\n-\n\n`;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  return `${title}:\n${contentStr}\n\n`;
}

export function exportMedicalRecordToText(record: MedicalRecordResponseDto): string {
  const soap = formatSOAPNotes(record);
  return `
REKAM MEDIS PASIEN

Nomor RM: ${record.patient?.nomor_rekam_medis || '-'}
Nama Pasien: ${record.patient?.nama_lengkap || '-'}
Tanggal Janji: ${record.appointment?.appointment_date || '-'}
Dokter: ${record.doctor?.nama_lengkap || '-'}

${formatSOAPSection('SUBJEKTIF', soap.subjektif)}
${formatSOAPSection('OBJEKTIF', soap.objektif)}
${formatSOAPSection('ASSESSMENT', soap.assessment)}
${formatSOAPSection('PLAN', soap.plan)}

Dibuat pada: ${record.created_at}
  `.trim();
}

export function validateSOAPData(data: {
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.subjektif?.trim()) errors.push('Subjektif harus diisi');
  if (!data.objektif?.trim()) errors.push('Objektif harus diisi');
  if (!data.assessment?.trim()) errors.push('Assessment harus diisi');
  if (!data.plan?.trim()) errors.push('Plan harus diisi');
  return { isValid: errors.length === 0, errors };
}