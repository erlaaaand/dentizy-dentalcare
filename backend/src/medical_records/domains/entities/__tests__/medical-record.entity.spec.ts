// ============================================================================
// IMPORTS
// ============================================================================
import { MedicalRecord } from '../medical-record.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockAppointment = (): Appointment => ({
  id: 1,
  patient_id: 1,
  doctor_id: 2,
  tanggal_janji: new Date('2024-01-15'),
  status: AppointmentStatus.DIJADWALKAN,
} as Appointment);

const createMockDoctor = (): User => ({
  id: 2,
  nama_lengkap: 'Dr. John Doe',
  username: 'doctor.john',
} as User);

const createMockPatient = (): Patient => ({
  id: 1,
  nama_lengkap: 'Jane Smith',
  nomor_rekam_medis: 'RM001',
} as Patient);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecord Entity', () => {
  let medicalRecord: MedicalRecord;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(() => {
    medicalRecord = new MedicalRecord();
    medicalRecord.id = 1;
    medicalRecord.appointment_id = 1;
    medicalRecord.doctor_id = 2;
    medicalRecord.patient_id = 1;
    medicalRecord.subjektif = 'Pasien mengeluh sakit kepala';
    medicalRecord.objektif = 'TD: 120/80, Suhu: 36.5°C';
    medicalRecord.assessment = 'Tension headache';
    medicalRecord.plan = 'Istirahat cukup, paracetamol 500mg';
    medicalRecord.created_at = new Date('2024-01-15');
    medicalRecord.updated_at = new Date('2024-01-15');
  });

  // ==========================================================================
  // BASIC TESTS
  // ==========================================================================
  it('should be defined', () => {
    expect(medicalRecord).toBeDefined();
  });

  it('should have all required properties', () => {
    expect(medicalRecord.id).toBe(1);
    expect(medicalRecord.appointment_id).toBe(1);
    expect(medicalRecord.doctor_id).toBe(2);
    expect(medicalRecord.patient_id).toBe(1);
    expect(medicalRecord.subjektif).toBeDefined();
    expect(medicalRecord.objektif).toBeDefined();
    expect(medicalRecord.assessment).toBeDefined();
    expect(medicalRecord.plan).toBeDefined();
  });

  // ==========================================================================
  // NORMALIZE DATA TESTS
  // ==========================================================================
  describe('normalizeData', () => {
    it('should trim subjektif field', () => {
      medicalRecord.subjektif = '  Pasien mengeluh  ';
      medicalRecord.normalizeData();
      expect(medicalRecord.subjektif).toBe('Pasien mengeluh');
    });

    it('should trim objektif field', () => {
      medicalRecord.objektif = '  TD: 120/80  ';
      medicalRecord.normalizeData();
      expect(medicalRecord.objektif).toBe('TD: 120/80');
    });

    it('should trim assessment field', () => {
      medicalRecord.assessment = '  Tension headache  ';
      medicalRecord.normalizeData();
      expect(medicalRecord.assessment).toBe('Tension headache');
    });

    it('should trim plan field', () => {
      medicalRecord.plan = '  Istirahat cukup  ';
      medicalRecord.normalizeData();
      expect(medicalRecord.plan).toBe('Istirahat cukup');
    });

    it('should handle null values', () => {
      medicalRecord.subjektif = null;
      medicalRecord.objektif = null;
      medicalRecord.assessment = null;
      medicalRecord.plan = null;

      expect(() => medicalRecord.normalizeData()).not.toThrow();
    });

    it('should handle undefined values', () => {
      medicalRecord.subjektif = undefined;
      medicalRecord.objektif = undefined;
      medicalRecord.assessment = undefined;
      medicalRecord.plan = undefined;

      expect(() => medicalRecord.normalizeData()).not.toThrow();
    });
  });

  // ==========================================================================
  // VIRTUAL FIELD TESTS (umur_rekam)
  // ==========================================================================
  describe('umur_rekam (virtual field)', () => {
    it('should calculate age in days correctly', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      medicalRecord.created_at = thirtyDaysAgo;

      const age = medicalRecord.umur_rekam;
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(31);
    });

    it('should return 0 for today\'s record', () => {
      medicalRecord.created_at = new Date();

      const age = medicalRecord.umur_rekam;
      expect(age).toBe(0);
    });

    it('should return null if created_at is not set', () => {
      medicalRecord.created_at = null;

      const age = medicalRecord.umur_rekam;
      expect(age).toBeNull();
    });

    it('should handle very old records', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      medicalRecord.created_at = oneYearAgo;

      const age = medicalRecord.umur_rekam;
      expect(age).toBeGreaterThanOrEqual(364);
      expect(age).toBeLessThanOrEqual(366);
    });
  });

  // ==========================================================================
  // RELATIONS TESTS
  // ==========================================================================
  describe('Relations', () => {
    it('should have appointment relation', () => {
      const appointment = createMockAppointment();
      medicalRecord.appointment = appointment;

      expect(medicalRecord.appointment).toBeDefined();
      expect(medicalRecord.appointment.id).toBe(1);
    });

    it('should have doctor relation', () => {
      const doctor = createMockDoctor();
      medicalRecord.doctor = doctor;

      expect(medicalRecord.doctor).toBeDefined();
      expect(medicalRecord.doctor.id).toBe(2);
      expect(medicalRecord.doctor.nama_lengkap).toBe('Dr. John Doe');
    });

    it('should have patient relation', () => {
      const patient = createMockPatient();
      medicalRecord.patient = patient;

      expect(medicalRecord.patient).toBeDefined();
      expect(medicalRecord.patient.id).toBe(1);
      expect(medicalRecord.patient.nama_lengkap).toBe('Jane Smith');
    });
  });

  // ==========================================================================
  // SOAP FIELDS TESTS
  // ==========================================================================
  describe('SOAP Fields', () => {
    it('should allow all SOAP fields to be set', () => {
      expect(medicalRecord.subjektif).toBe('Pasien mengeluh sakit kepala');
      expect(medicalRecord.objektif).toBe('TD: 120/80, Suhu: 36.5°C');
      expect(medicalRecord.assessment).toBe('Tension headache');
      expect(medicalRecord.plan).toBe('Istirahat cukup, paracetamol 500mg');
    });

    it('should allow SOAP fields to be null', () => {
      medicalRecord.subjektif = null;
      medicalRecord.objektif = null;
      medicalRecord.assessment = null;
      medicalRecord.plan = null;

      expect(medicalRecord.subjektif).toBeNull();
      expect(medicalRecord.objektif).toBeNull();
      expect(medicalRecord.assessment).toBeNull();
      expect(medicalRecord.plan).toBeNull();
    });

    it('should handle long text content', () => {
      const longText = 'A'.repeat(5000);
      medicalRecord.subjektif = longText;

      expect(medicalRecord.subjektif.length).toBe(5000);
    });
  });

  // ==========================================================================
  // TIMESTAMP TESTS
  // ==========================================================================
  describe('Timestamps', () => {
    it('should have created_at timestamp', () => {
      expect(medicalRecord.created_at).toBeInstanceOf(Date);
    });

    it('should have updated_at timestamp', () => {
      expect(medicalRecord.updated_at).toBeInstanceOf(Date);
    });

    it('should have deleted_at for soft delete', () => {
      medicalRecord.deleted_at = new Date();
      expect(medicalRecord.deleted_at).toBeInstanceOf(Date);
    });

    it('should have null deleted_at by default', () => {
      const newRecord = new MedicalRecord();
      expect(newRecord.deleted_at).toBeUndefined();
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  describe('Integration Scenarios', () => {
    it('should create a complete medical record with all relations', () => {
      const appointment = createMockAppointment();
      const doctor = createMockDoctor();
      const patient = createMockPatient();

      medicalRecord.appointment = appointment;
      medicalRecord.doctor = doctor;
      medicalRecord.patient = patient;

      expect(medicalRecord.appointment).toBeDefined();
      expect(medicalRecord.doctor).toBeDefined();
      expect(medicalRecord.patient).toBeDefined();
      expect(medicalRecord.appointment_id).toBe(appointment.id);
      expect(medicalRecord.doctor_id).toBe(doctor.id);
      expect(medicalRecord.patient_id).toBe(patient.id);
    });

    it('should handle record lifecycle', () => {
      // Creation
      expect(medicalRecord.created_at).toBeDefined();
      expect(medicalRecord.deleted_at).toBeUndefined();

      // Update
      medicalRecord.subjektif = 'Updated subjektif';
      medicalRecord.updated_at = new Date();
      expect(medicalRecord.updated_at).toBeDefined();

      // Soft delete
      medicalRecord.deleted_at = new Date();
      expect(medicalRecord.deleted_at).toBeDefined();
    });
  });
});