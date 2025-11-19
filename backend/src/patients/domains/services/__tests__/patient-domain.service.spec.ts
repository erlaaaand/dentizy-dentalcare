// __tests__/domains/services/patient-domain.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { PatientDomainService } from '../../../domains/services/patient-domain.service';
import { Patient } from '../../../domains/entities/patient.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { Gender } from '../../entities/patient.entity'; // Asumsi path enum

// 2. MOCK DATA
const basePatient: Partial<Patient> = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
  is_active: true,
  email: 'budi@test.com',
  no_hp: '08123456789',
  tanggal_lahir: new Date('1990-01-01'),
  jenis_kelamin: Gender.MALE,
  alamat: 'Jl. Test No. 1',
  appointments: [],
};

// Helper untuk membuat tanggal relatif (untuk tes umur/new patient)
const getDateYearsAgo = (years: number): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// 3. TEST SUITE
describe('PatientDomainService', () => {
  let service: PatientDomainService;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientDomainService],
    }).compile();

    service = module.get<PatientDomainService>(PatientDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS & 6. SUB-GROUP TESTS

  describe('isEligibleForAppointment', () => {
    it('should return true if patient is active and has contact info', () => {
      const patient = { ...basePatient, is_active: true, email: 'a@b.com' } as Patient;
      expect(service.isEligibleForAppointment(patient)).toBe(true);
    });

    it('should return false if patient is inactive', () => {
      const patient = { ...basePatient, is_active: false } as Patient;
      expect(service.isEligibleForAppointment(patient)).toBe(false);
    });

    it('should return false if patient has NO email AND NO phone', () => {
      const patient = { 
        ...basePatient, 
        is_active: true, 
        email: null, 
        no_hp: null 
      } as Patient;
      expect(service.isEligibleForAppointment(patient)).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should allow deletion if no appointments exist', () => {
      const patient = { ...basePatient, appointments: [] } as Patient;
      const result = service.canBeDeleted(patient);
      expect(result.allowed).toBe(true);
    });

    it('should allow deletion if appointments are finished or cancelled', () => {
      const patient = { 
        ...basePatient, 
        appointments: [
          { status: 'selesai' }, 
          { status: 'dibatalkan' }
        ] as Appointment[] 
      } as Patient;
      const result = service.canBeDeleted(patient);
      expect(result.allowed).toBe(true);
    });

    it('should NOT allow deletion if there is a scheduled appointment', () => {
      const patient = { 
        ...basePatient, 
        appointments: [{ status: 'dijadwalkan' } as Appointment] 
      } as Patient;
      
      const result = service.canBeDeleted(patient);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('janji temu aktif');
    });

    it('should NOT allow deletion if there is an ongoing appointment', () => {
      const patient = { 
        ...basePatient, 
        appointments: [{ status: AppointmentStatus.DIJADWALKAN } as Appointment]
      } as Patient;
      
      const result = service.canBeDeleted(patient);
      expect(result.allowed).toBe(false);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      // Lahir 20 tahun lalu
      const birthDate = getDateYearsAgo(20);
      expect(service.calculateAge(birthDate)).toBe(20);
    });

    it('should handle age calculation before birthday in current year', () => {
      // Logika: Tahun ini 2024. Lahir 2000.
      // Jika ulang tahun besok, umur harusnya masih 23, bukan 24.
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate() + 1); 
      
      expect(service.calculateAge(birthDate)).toBe(19);
    });

    it('should return null if birthDate is missing', () => {
      expect(service.calculateAge(null)).toBeNull();
    });
  });

  describe('Age Checks (isMinor / isSenior)', () => {
    it('should identify minor (< 18)', () => {
      const patient = { ...basePatient, tanggal_lahir: getDateYearsAgo(17) } as Patient;
      expect(service.isMinor(patient)).toBe(true);
      expect(service.isSenior(patient)).toBe(false);
    });

    it('should identify adult (18)', () => {
      const patient = { ...basePatient, tanggal_lahir: getDateYearsAgo(18) } as Patient;
      expect(service.isMinor(patient)).toBe(false);
      expect(service.isSenior(patient)).toBe(false);
    });

    it('should identify senior (>= 65)', () => {
      const patient65 = { ...basePatient, tanggal_lahir: getDateYearsAgo(65) } as Patient;
      expect(service.isSenior(patient65)).toBe(true);

      const patient80 = { ...basePatient, tanggal_lahir: getDateYearsAgo(80) } as Patient;
      expect(service.isSenior(patient80)).toBe(true);
    });
  });

  describe('isNewPatient', () => {
    it('should return true if registered within last 30 days', () => {
      const recentDate = getDateDaysAgo(10);
      expect(service.isNewPatient(recentDate)).toBe(true);
    });

    it('should return true if registered today', () => {
      expect(service.isNewPatient(new Date())).toBe(true);
    });

    it('should return false if registered more than 30 days ago', () => {
      const oldDate = getDateDaysAgo(31);
      expect(service.isNewPatient(oldDate)).toBe(false);
    });
  });

  describe('getFullDisplayName', () => {
    it('should format name with record number', () => {
      const patient = { 
        nama_lengkap: 'John Doe', 
        nomor_rekam_medis: 'RM-123' 
      } as Patient;
      
      expect(service.getFullDisplayName(patient)).toBe('John Doe (RM-123)');
    });
  });

  describe('needsContactUpdate', () => {
    it('should return true if both email and phone are missing', () => {
      const patient = { email: null, no_hp: '' } as Patient;
      expect(service.needsContactUpdate(patient)).toBe(true);
    });

    it('should return false if email exists', () => {
      const patient = { email: 'a@b.com', no_hp: null } as Patient;
      expect(service.needsContactUpdate(patient)).toBe(false);
    });
  });

  describe('isDataCompleteForProcedure', () => {
    it('should return complete true if all fields are present', () => {
      const patient = {
        tanggal_lahir: new Date(),
        jenis_kelamin: Gender.MALE,
        alamat: 'Jl. A',
        no_hp: '081',
      } as Patient;

      const result = service.isDataCompleteForProcedure(patient);
      expect(result.complete).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should identify missing fields', () => {
      const patient = {
        tanggal_lahir: null, // Missing
        jenis_kelamin: Gender.FEMALE,
        alamat: null, // Missing
        email: 'a@b.com' // Contact exists (email)
      } as Patient;

      const result = service.isDataCompleteForProcedure(patient);
      expect(result.complete).toBe(false);
      expect(result.missing).toContain('tanggal_lahir');
      expect(result.missing).toContain('alamat');
      expect(result.missing).not.toContain('kontak'); // Contact is present
    });
  });

  describe('getAgeCategory', () => {
    it('should return "child" for age < 13', () => {
      const p = { ...basePatient, tanggal_lahir: getDateYearsAgo(10) } as Patient;
      expect(service.getAgeCategory(p)).toBe('child');
    });

    it('should return "teen" for age 13-17', () => {
      const p = { ...basePatient, tanggal_lahir: getDateYearsAgo(15) } as Patient;
      expect(service.getAgeCategory(p)).toBe('teen');
    });

    it('should return "adult" for age 18-64', () => {
      const p = { ...basePatient, tanggal_lahir: getDateYearsAgo(30) } as Patient;
      expect(service.getAgeCategory(p)).toBe('adult');
    });

    it('should return "senior" for age >= 65', () => {
      const p = { ...basePatient, tanggal_lahir: getDateYearsAgo(70) } as Patient;
      expect(service.getAgeCategory(p)).toBe('senior');
    });

    it('should return "unknown" if birth date is missing', () => {
      const p = { ...basePatient, tanggal_lahir: null } as Patient;
      expect(service.getAgeCategory(p)).toBe('unknown');
    });
  });
});