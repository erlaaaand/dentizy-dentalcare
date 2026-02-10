import type { PublicBookingDto, PublicBookingFormData  } from '../../../../types/public-appointments/public-appointments.types';

export interface ValidationError {
  field: keyof PublicBookingDto;
  message: string;
}

export interface BookingValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Public Appointments Validators
 * Validates public appointment booking data before submission
 */
export class PublicAppointmentsValidators {
  /**
   * Validate NIK
   */
  validateNIK(nik: string): ValidationError | null {
    if (!nik || nik.trim() === '') {
      return { field: 'nik', message: 'NIK wajib diisi' };
    }
    
    if (!/^\d{16}$/.test(nik)) {
      return { field: 'nik', message: 'NIK harus 16 digit angka' };
    }

    return null;
  }

  /**
   * Validate nama lengkap
   */
  validateNamaLengkap(nama: string): ValidationError | null {
    if (!nama || nama.trim() === '') {
      return { field: 'nama_lengkap', message: 'Nama wajib diisi' };
    }
    
    if (nama.length < 3) {
      return { field: 'nama_lengkap', message: 'Nama minimal 3 karakter' };
    }

    return null;
  }

  /**
   * Validate tanggal lahir
   */
  validateTanggalLahir(tanggalLahir: string): ValidationError | null {
    if (!tanggalLahir) {
      return { field: 'tanggal_lahir', message: 'Tanggal lahir wajib diisi' };
    }

    const birthDate = new Date(tanggalLahir);
    if (isNaN(birthDate.getTime())) {
      return { field: 'tanggal_lahir', message: 'Format tanggal lahir tidak valid' };
    }

    // Check if birth date is not in the future
    const today = new Date();
    if (birthDate > today) {
      return { field: 'tanggal_lahir', message: 'Tanggal lahir tidak boleh di masa depan' };
    }

    return null;
  }

  /**
   * Validate jenis kelamin
   */
  validateJenisKelamin(jenisKelamin: string): ValidationError | null {
    if (!jenisKelamin) {
      return { field: 'jenis_kelamin', message: 'Jenis kelamin wajib dipilih' };
    }

    const validGenders = ['L', 'P', 'laki-laki', 'perempuan'];
    if (!validGenders.includes(jenisKelamin)) {
      return { field: 'jenis_kelamin', message: 'Jenis kelamin tidak valid' };
    }

    return null;
  }

  /**
   * Validate nomor HP
   */
  validateNoHP(noHp: string): ValidationError | null {
    if (!noHp || noHp.trim() === '') {
      return { field: 'no_hp', message: 'Nomor HP wajib diisi' };
    }
    
    if (!/^(\+62|62|0)[0-9]{9,12}$/.test(noHp)) {
      return { field: 'no_hp', message: 'Format nomor HP tidak valid' };
    }

    return null;
  }

  /**
   * Validate email (optional)
   */
  validateEmail(email?: string): ValidationError | null {
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { field: 'email', message: 'Format email tidak valid' };
      }
    }

    return null;
  }

  /**
   * Validate tanggal janji
   */
  validateTanggalJanji(tanggalJanji: string): ValidationError | null {
    if (!tanggalJanji) {
      return { field: 'tanggal_janji', message: 'Tanggal janji wajib dipilih' };
    }

    const appointmentDate = new Date(tanggalJanji);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return { field: 'tanggal_janji', message: 'Tanggal janji tidak boleh di masa lalu' };
    }

    return null;
  }

  /**
   * Validate jam janji
   */
  validateJamJanji(jamJanji: string): ValidationError | null {
    if (!jamJanji || jamJanji.trim() === '') {
      return { field: 'jam_janji', message: 'Jam janji wajib dipilih' };
    }

    // Validate time format HH:mm
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(jamJanji)) {
      return { field: 'jam_janji', message: 'Format jam tidak valid (gunakan HH:mm)' };
    }

    return null;
  }

  /**
   * Validate doctor ID
   */
  validateDoctorId(doctorId: string): ValidationError | null {
    if (!doctorId) {
      return { field: 'doctor_id', message: 'Dokter wajib dipilih' };
    }

    return null;
  }

  /**
   * Validate booking data
   */
  validateBooking(bookingData: PublicBookingFormData): BookingValidation {
    const errors: ValidationError[] = [];

    // Validate NIK
    const nikError = this.validateNIK(bookingData.nik);
    if (nikError) errors.push(nikError);

    // Validate nama
    const namaError = this.validateNamaLengkap(bookingData.nama_lengkap);
    if (namaError) errors.push(namaError);

    // Validate tanggal lahir
    const tanggalLahirError = this.validateTanggalLahir(bookingData.tanggal_lahir);
    if (tanggalLahirError) errors.push(tanggalLahirError);

    // Validate jenis kelamin
    const jenisKelaminError = this.validateJenisKelamin(bookingData.jenis_kelamin);
    if (jenisKelaminError) errors.push(jenisKelaminError);

    // Validate nomor HP
    const noHpError = this.validateNoHP(bookingData.no_hp);
    if (noHpError) errors.push(noHpError);

    // Validate email (optional)
    const emailError = this.validateEmail(bookingData.email);
    if (emailError) errors.push(emailError);

    // Validate tanggal janji
    const tanggalJanjiError = this.validateTanggalJanji(bookingData.tanggal_janji);
    if (tanggalJanjiError) errors.push(tanggalJanjiError);

    // Validate jam janji
    const jamJanjiError = this.validateJamJanji(bookingData.jam_janji);
    if (jamJanjiError) errors.push(jamJanjiError);

    // Validate doctor ID
    const doctorIdError = this.validateDoctorId(bookingData.doctor_id);
    if (doctorIdError) errors.push(doctorIdError);

    // Validate terms acceptance (if in form data)
    if ('acceptTerms' in bookingData && !bookingData.acceptTerms) {
      errors.push({ 
        field: 'nik', // Use a valid field from DTO
        message: 'Anda harus menyetujui syarat dan ketentuan' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const publicAppointmentsValidators = new PublicAppointmentsValidators();