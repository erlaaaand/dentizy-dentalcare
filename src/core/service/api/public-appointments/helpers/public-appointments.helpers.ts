/**
 * Public Appointments Helper Functions
 * Utility functions for public appointments
 */
export class PublicAppointmentsHelpers {
  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to +62 format
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Format NIK (add spaces for readability)
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
   * Calculate age from birth date
   */
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Check if appointment date is in the future
   */
  isFutureDate(dateString: string): boolean {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointmentDate >= today;
  }

  /**
   * Format appointment time for display
   */
  formatAppointmentTime(time: string): string {
    // Assuming time is in HH:mm format
    return `${time} WIB`;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    return /^(\+62|62|0)[0-9]{9,12}$/.test(phone);
  }

  /**
   * Get age group
   */
  getAgeGroup(age: number): string {
    if (age < 18) return 'Anak';
    if (age <= 30) return 'Dewasa Muda';
    if (age <= 50) return 'Dewasa';
    return 'Lansia';
  }

  /**
   * Check if date is today
   */
  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is tomorrow
   */
  isTomorrow(dateString: string): boolean {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  }

  /**
   * Get gender label
   */
  getGenderLabel(gender: string): string {
    const labels: Record<string, string> = {
      'L': 'Laki-laki',
      'P': 'Perempuan',
      'laki-laki': 'Laki-laki',
      'perempuan': 'Perempuan'
    };
    return labels[gender] || gender;
  }
}

export const publicAppointmentsHelpers = new PublicAppointmentsHelpers();