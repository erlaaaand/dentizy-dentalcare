/**
 * Patients Helper Functions
 */
export class PatientsHelpers {
  /**
   * Calculate patient age from birth date
   */
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format NIK with spaces for readability
   */
  formatNIK(nik: string): string {
    const cleaned = nik.replace(/\D/g, '');
    return cleaned.replace(/(\d{6})(\d{6})(\d{4})/, '$1 $2 $3');
  }

  /**
   * Validate NIK format
   */
  isValidNIK(nik: string): boolean {
    const cleaned = nik.replace(/\D/g, '');
    return /^\d{16}$/.test(cleaned);
  }

  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Get age group
   */
  getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age <= 30) return '18-30';
    if (age <= 50) return '31-50';
    return '51+';
  }

  /**
   * Check if patient is new (registered within last 30 days)
   */
  isNewPatient(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }
}

export const patientsHelpers = new PatientsHelpers();