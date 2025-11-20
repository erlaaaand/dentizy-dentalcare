import { MedicalRecordResponseDto } from '../medical-record-response.dto';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { object } from 'joi';

describe('MedicalRecordResponseDto', () => {
  // ==================== MOCK DATA ====================
  const mockResponseDto = (): MedicalRecordResponseDto => {
    const dto = new MedicalRecordResponseDto();
    return Object.assign(dto, {
      id: 1,
      appointment_id: 1,
      doctor_id: 1,
      patient_id: 1,
      subjektif: 'Pasien mengeluh demam',
      objektif: 'Suhu: 38.5°C',
      assessment: 'Demam dengan ISPA',
      plan: 'Paracetamol 3x500mg',
      created_at: new Date('2025-01-15'),
      updated_at: new Date('2025-01-15'),
      deleted_at: null,
      umur_rekam: 10,
      appointment: {
        id: 1,
        appointment_date: new Date('2025-01-15'),
        status: AppointmentStatus.SELESAI,
        patient: {
          id: 1,
          nama_lengkap: 'John Doe',
          no_rm: 'RM001',
        },
      },
      doctor: {
        id: 1,
        name: 'Dr. Smith',
      },
      patient: {
        id: 1,
        nama_lengkap: 'John Doe',
        no_rm: 'RM001',
        tanggal_lahir: new Date('1990-01-01'),
      },
    })
  };

  // ==================== SETUP AND TEARDOWN ====================
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== DTO STRUCTURE TESTS ====================
  describe('DTO Structure', () => {
    it('should create response DTO with all required properties', () => {
      const dto = new MedicalRecordResponseDto();

      expect(dto).toBeDefined();
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('appointment_id');
      expect(dto).toHaveProperty('doctor_id');
      expect(dto).toHaveProperty('patient_id');
      expect(dto).toHaveProperty('subjektif');
      expect(dto).toHaveProperty('objektif');
      expect(dto).toHaveProperty('assessment');
      expect(dto).toHaveProperty('plan');
      expect(dto).toHaveProperty('created_at');
      expect(dto).toHaveProperty('updated_at');
      expect(dto).toHaveProperty('deleted_at');
      expect(dto).toHaveProperty('umur_rekam');
    });

    it('should have optional relation properties', () => {
      const dto = new MedicalRecordResponseDto();

      expect(dto).toHaveProperty('appointment');
      expect(dto).toHaveProperty('doctor');
      expect(dto).toHaveProperty('patient');
    });
  });

  // ==================== BASIC PROPERTIES TESTS ====================
  describe('Basic Properties', () => {
    it('should accept id as number', () => {
      const dto = new MedicalRecordResponseDto();
      dto.id = 1;

      expect(dto.id).toBe(1);
      expect(typeof dto.id).toBe('number');
    });

    it('should accept appointment_id as number', () => {
      const dto = new MedicalRecordResponseDto();
      dto.appointment_id = 1;

      expect(dto.appointment_id).toBe(1);
      expect(typeof dto.appointment_id).toBe('number');
    });

    it('should accept doctor_id as number', () => {
      const dto = new MedicalRecordResponseDto();
      dto.doctor_id = 1;

      expect(dto.doctor_id).toBe(1);
      expect(typeof dto.doctor_id).toBe('number');
    });

    it('should accept patient_id as number', () => {
      const dto = new MedicalRecordResponseDto();
      dto.patient_id = 1;

      expect(dto.patient_id).toBe(1);
      expect(typeof dto.patient_id).toBe('number');
    });

    it('should accept umur_rekam as number', () => {
      const dto = new MedicalRecordResponseDto();
      dto.umur_rekam = 10;

      expect(dto.umur_rekam).toBe(10);
      expect(typeof dto.umur_rekam).toBe('number');
    });
  });

  // ==================== SOAP FIELDS TESTS ====================
  describe('SOAP Fields', () => {
    it('should accept subjektif as string', () => {
      const dto = new MedicalRecordResponseDto();
      dto.subjektif = 'Test subjektif';

      expect(dto.subjektif).toBe('Test subjektif');
      expect(typeof dto.subjektif).toBe('string');
    });

    it('should accept objektif as string', () => {
      const dto = new MedicalRecordResponseDto();
      dto.objektif = 'Test objektif';

      expect(dto.objektif).toBe('Test objektif');
      expect(typeof dto.objektif).toBe('string');
    });

    it('should accept assessment as string', () => {
      const dto = new MedicalRecordResponseDto();
      dto.assessment = 'Test assessment';

      expect(dto.assessment).toBe('Test assessment');
      expect(typeof dto.assessment).toBe('string');
    });

    it('should accept plan as string', () => {
      const dto = new MedicalRecordResponseDto();
      dto.plan = 'Test plan';

      expect(dto.plan).toBe('Test plan');
      expect(typeof dto.plan).toBe('string');
    });

    it('should allow empty SOAP fields', () => {
      const dto = new MedicalRecordResponseDto();
      dto.subjektif = '';
      dto.objektif = '';
      dto.assessment = '';
      dto.plan = '';

      expect(dto.subjektif).toBe('');
      expect(dto.objektif).toBe('');
      expect(dto.assessment).toBe('');
      expect(dto.plan).toBe('');
    });
  });

  // ==================== DATE FIELDS TESTS ====================
  describe('Date Fields', () => {
    it('should accept created_at as Date', () => {
      const dto = new MedicalRecordResponseDto();
      const date = new Date();
      dto.created_at = date;

      expect(dto.created_at).toEqual(date);
      expect(dto.created_at).toBeInstanceOf(Date);
    });

    it('should accept updated_at as Date', () => {
      const dto = new MedicalRecordResponseDto();
      const date = new Date();
      dto.updated_at = date;

      expect(dto.updated_at).toEqual(date);
      expect(dto.updated_at).toBeInstanceOf(Date);
    });

    it('should accept deleted_at as Date or null', () => {
      const dto = new MedicalRecordResponseDto();

      dto.deleted_at = null;
      expect(dto.deleted_at).toBeNull();

      const date = new Date();
      dto.deleted_at = date;
      expect(dto.deleted_at).toEqual(date);
    });

    it('should indicate soft-deleted when deleted_at is set', () => {
      const dto = new MedicalRecordResponseDto();
      dto.deleted_at = new Date();

      expect(dto.deleted_at).not.toBeNull();
      expect(dto.deleted_at).toBeInstanceOf(Date);
    });
  });

  // ==================== APPOINTMENT RELATION TESTS ====================
  describe('Appointment Relation', () => {
    it('should accept appointment relation object', () => {
      const dto = new MedicalRecordResponseDto();
      dto.appointment = {
        id: 1,
        appointment_date: new Date(),
        status: AppointmentStatus.SELESAI,
      };

      expect(dto.appointment).toBeDefined();
      expect(dto.appointment.id).toBe(1);
      expect(dto.appointment.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should include nested patient in appointment', () => {
      const dto = new MedicalRecordResponseDto();
      dto.appointment = {
        id: 1,
        appointment_date: new Date(),
        status: AppointmentStatus.SELESAI,
        patient: {
          id: 1,
          nama_lengkap: 'John Doe',
          no_rm: 'RM001',
        },
      };

      expect(dto.appointment.patient).toBeDefined();
      expect(dto.appointment.patient?.nama_lengkap).toBe('John Doe');
      expect(dto.appointment.patient?.no_rm).toBe('RM001');
    });

    it('should allow appointment to be undefined', () => {
      const dto = new MedicalRecordResponseDto();

      expect(dto.appointment).toBeUndefined();
    });

    it('should handle different appointment statuses', () => {
      const dto = new MedicalRecordResponseDto();

      dto.appointment = {
        id: 1,
        appointment_date: new Date(),
        status: AppointmentStatus.DIJADWALKAN,
      };
      expect(dto.appointment.status).toBe(AppointmentStatus.DIJADWALKAN);

      dto.appointment.status = AppointmentStatus.DIBATALKAN;
      expect(dto.appointment.status).toBe(AppointmentStatus.DIBATALKAN);
    });
  });

  // ==================== DOCTOR RELATION TESTS ====================
  describe('Doctor Relation', () => {
    it('should accept doctor relation object', () => {
      const dto = new MedicalRecordResponseDto();
      dto.doctor = {
        id: 1,
        name: 'Dr. Smith',
      };

      expect(dto.doctor).toBeDefined();
      expect(dto.doctor.id).toBe(1);
      expect(dto.doctor.name).toBe('Dr. Smith');
    });

    it('should allow doctor to be undefined', () => {
      const dto = new MedicalRecordResponseDto();

      expect(dto.doctor).toBeUndefined();
    });

    it('should handle different doctor names', () => {
      const dto = new MedicalRecordResponseDto();
      dto.doctor = {
        id: 1,
        name: 'Dr. John Doe',
      };

      expect(dto.doctor.name).toBe('Dr. John Doe');
    });
  });

  // ==================== PATIENT RELATION TESTS ====================
  describe('Patient Relation', () => {
    it('should accept patient relation object', () => {
      const dto = new MedicalRecordResponseDto();
      dto.patient = {
        id: 1,
        nama_lengkap: 'John Doe',
        no_rm: 'RM001',
        tanggal_lahir: new Date('1990-01-01'),
      };

      expect(dto.patient).toBeDefined();
      expect(dto.patient.id).toBe(1);
      expect(dto.patient.nama_lengkap).toBe('John Doe');
      expect(dto.patient.no_rm).toBe('RM001');
      expect(dto.patient.tanggal_lahir).toBeInstanceOf(Date);
    });

    it('should allow patient to be undefined', () => {
      const dto = new MedicalRecordResponseDto();

      expect(dto.patient).toBeUndefined();
    });

    it('should handle patient birth date', () => {
      const dto = new MedicalRecordResponseDto();
      const birthDate = new Date('1990-01-01');
      dto.patient = {
        id: 1,
        nama_lengkap: 'John Doe',
        no_rm: 'RM001',
        tanggal_lahir: birthDate,
      };

      expect(dto.patient.tanggal_lahir).toEqual(birthDate);
    });
  });

  // ==================== COMPLETE RESPONSE TESTS ====================
  describe('Complete Response', () => {
    it('should create complete response with all relations', () => {
      const dto = Object.assign(
        new MedicalRecordResponseDto(),
        mockResponseDto() // ← harus dipanggil
      );

      expect(dto.id).toBe(1);
      expect(dto.appointment).toBeDefined();
      expect(dto.doctor).toBeDefined();
      expect(dto.patient).toBeDefined();
      expect(dto.subjektif).toBe('Pasien mengeluh demam');
      expect(dto.objektif).toBe('Suhu: 38.5°C');
      expect(dto.assessment).toBe('Demam dengan ISPA');
      expect(dto.plan).toBe('Paracetamol 3x500mg');
    });

    it('should include all required fields', () => {
      const dto = Object.assign(new MedicalRecordResponseDto(), mockResponseDto);

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('appointment_id');
      expect(dto).toHaveProperty('doctor_id');
      expect(dto).toHaveProperty('patient_id');
      expect(dto).toHaveProperty('created_at');
      expect(dto).toHaveProperty('updated_at');
    });

    it('should handle response without relations', () => {
      const dto = new MedicalRecordResponseDto();
      dto.id = 1;
      dto.appointment_id = 1;
      dto.doctor_id = 1;
      dto.patient_id = 1;
      dto.subjektif = 'Test';
      dto.objektif = 'Test';
      dto.assessment = 'Test';
      dto.plan = 'Test';
      dto.created_at = new Date();
      dto.updated_at = new Date();
      dto.deleted_at = null;
      dto.umur_rekam = 0;

      expect(dto.id).toBe(1);
      expect(dto.appointment).toBeUndefined();
      expect(dto.doctor).toBeUndefined();
      expect(dto.patient).toBeUndefined();
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle zero umur_rekam', () => {
      const dto = new MedicalRecordResponseDto();
      dto.umur_rekam = 0;

      expect(dto.umur_rekam).toBe(0);
    });

    it('should handle large umur_rekam values', () => {
      const dto = new MedicalRecordResponseDto();
      dto.umur_rekam = 365;

      expect(dto.umur_rekam).toBe(365);
    });

    it('should handle null SOAP fields', () => {
      const dto = new MedicalRecordResponseDto();
      dto.subjektif = null;
      dto.objektif = null;
      dto.assessment = null;
      dto.plan = null;

      expect(dto.subjektif).toBeNull();
      expect(dto.objektif).toBeNull();
      expect(dto.assessment).toBeNull();
      expect(dto.plan).toBeNull();
    });

    it('should handle very long SOAP content', () => {
      const dto = new MedicalRecordResponseDto();
      const longText = 'a'.repeat(5000);
      dto.subjektif = longText;

      expect(dto.subjektif.length).toBe(5000);
    });

    it('should preserve special characters in SOAP fields', () => {
      const dto = new MedicalRecordResponseDto();
      dto.subjektif = 'Test with special chars: ñ, é, ü, ç';

      expect(dto.subjektif).toBe('Test with special chars: ñ, é, ü, ç');
    });

    it('should handle future dates', () => {
      const dto = new MedicalRecordResponseDto();
      const futureDate = new Date('2030-01-01');
      dto.created_at = futureDate;

      expect(dto.created_at).toEqual(futureDate);
      expect(dto.created_at > new Date()).toBe(true);
    });
  });

  // ==================== SERIALIZATION TESTS ====================
  describe('Serialization', () => {
    it('should be JSON serializable', () => {
      const dto = Object.assign(new MedicalRecordResponseDto(), mockResponseDto);

      expect(() => JSON.stringify(dto)).not.toThrow();
    });

    it('should preserve data after JSON round-trip', () => {
      const dto = Object.assign(new MedicalRecordResponseDto(), {
        id: 1,
        appointment_id: 1,
        doctor_id: 1,
        patient_id: 1,
        subjektif: 'Test',
        objektif: 'Test',
        assessment: 'Test',
        plan: 'Test',
        umur_rekam: 10,
      });

      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(1);
      expect(parsed.subjektif).toBe('Test');
      expect(parsed.umur_rekam).toBe(10);
    });
  });
});