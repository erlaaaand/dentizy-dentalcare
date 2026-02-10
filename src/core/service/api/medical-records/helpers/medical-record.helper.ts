import type { MedicalRecord } from '../../../../types/medical-records/medical-record.types';

/**
 * Medical Record Helper Functions
 */
export class MedicalRecordHelper {
  /**
   * Menghitung umur rekam medis dalam satuan hari
   */
  calculateAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Memeriksa apakah rekam medis masih bisa diedit (maksimal 30 hari)
   */
  canEdit(record: MedicalRecord): boolean {
    if (record.deleted_at) return false;
    if (!record.created_at) return false;

    const age = this.calculateAge(record.created_at);
    return age <= 30;
  }

  /**
   * Memeriksa apakah rekam medis bisa dihapus
   */
  canDelete(record: MedicalRecord): boolean {
    return !record.deleted_at;
  }

  /**
   * Memeriksa apakah rekam medis bisa dikembalikan (restore)
   */
  canRestore(record: MedicalRecord): boolean {
    return !!record.deleted_at;
  }

  /**
   * Memformat catatan SOAP untuk tampilan
   */
  formatSOAP(record: MedicalRecord): string {
    const parts: string[] = [];
    
    if (record.subjektif) parts.push(`S: ${record.subjektif}`);
    if (record.objektif) parts.push(`O: ${record.objektif}`);
    if (record.assessment) parts.push(`A: ${record.assessment}`);
    if (record.plan) parts.push(`P: ${record.plan}`);
    
    return parts.join('\n\n');
  }
}

export const medicalRecordHelper = new MedicalRecordHelper();