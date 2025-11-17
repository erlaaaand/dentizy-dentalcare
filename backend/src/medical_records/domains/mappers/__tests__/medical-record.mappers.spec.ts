// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordMapper } from '../medical-record.mappers';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { CreateMedicalRecordDto } from '../../../applications/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../../../applications/dto/update-medical-record.dto';
import { MedicalRecordResponseDto } from '../../../applications/dto/medical-record-response.dto';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockMedicalRecord = (): MedicalRecord => ({
  id: 1,
  appointment_id: 10,
  doctor_id: 2,
  patient_id: 3,
  subjektif: 'Pasien mengeluh sakit kepala',
  objektif: 'TD: 120/80, Suhu: 36.5°C',
  assessment: 'Tension headache',
  plan: 'Istirahat cukup, paracetamol 500mg',
  created_at: new Date('2024-01-15T10:00:00Z'),
  updated_at: new Date('2024-01-15T10:00:00Z'),
  deleted_at: null,
  appointment: {
    id: 10,
    tanggal_janji: new Date('2024-01-15T09:00:00Z'),
    status: AppointmentStatus.SELESAI,
    patient: {
      id: 3,
      nama_lengkap: 'Jane Smith',
      nomor_rekam_medis: 'RM001',
    },
  } as any,
  doctor: {
    id: 2,
    nama_lengkap: 'Dr. John Doe',
  } as any,
  patient: {
    id: 3,
    nama_lengkap: 'Jane Smith',
    nomor_rekam_medis: 'RM001',
    tanggal_lahir: new Date('1990-05-20'),
  } as any,
} as MedicalRecord);

const createMockCreateDto = (): CreateMedicalRecordDto => ({
  appointment_id: 10,
  user_id_staff: 2,
  subjektif: '  Pasien mengeluh sakit kepala  ',
  objektif: '  TD: 120/80  ',
  assessment: '  Tension headache  ',
  plan: '  Istirahat cukup  ',
});

const createMockUpdateDto = (): UpdateMedicalRecordDto => ({
  subjektif: 'Updated subjektif',
  objektif: 'Updated objektif',
  assessment: 'Updated assessment',
  plan: 'Updated plan',
});

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordMapper', () => {
  let mapper: MedicalRecordMapper;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordMapper],
    }).compile();

    mapper = module.get<MedicalRecordMapper>(MedicalRecordMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  // ==========================================================================
  // TO RESPONSE DTO TESTS
  // ==========================================================================
  describe('toResponseDto', () => {
    it('should map entity to response DTO with all fields', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toResponseDto(entity);

      expect(result).toBeInstanceOf(MedicalRecordResponseDto);
      expect(result.id).toBe(entity.id);
      expect(result.appointment_id).toBe(entity.appointment_id);
      expect(result.doctor_id).toBe(entity.doctor_id);
      expect(result.patient_id).toBe(entity.patient_id);
      expect(result.subjektif).toBe(entity.subjektif);
      expect(result.objektif).toBe(entity.objektif);
      expect(result.assessment).toBe(entity.assessment);
      expect(result.plan).toBe(entity.plan);
    });

    it('should calculate umur_rekam correctly', () => {
      const entity = createMockMedicalRecord();
      const today = new Date();
      const createdAt = new Date();
      createdAt.setDate(today.getDate() - 30);
      entity.created_at = createdAt;

      const result = mapper.toResponseDto(entity);

      expect(result.umur_rekam).toBeGreaterThanOrEqual(29);
      expect(result.umur_rekam).toBeLessThanOrEqual(31);
    });

    it('should map appointment relation when present', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toResponseDto(entity);

      expect(result.appointment).toBeDefined();
      expect(result.appointment?.id).toBe(entity.appointment.id);
      expect(result.appointment?.appointment_date).toEqual(entity.appointment.tanggal_janji);
      expect(result.appointment?.status).toBe(entity.appointment.status);
      expect(result.appointment?.patient).toBeDefined();
      expect(result.appointment?.patient?.id).toBe(3);
      expect(result.appointment?.patient?.nama_lengkap).toBe('Jane Smith');
    });

    it('should map doctor relation when present', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toResponseDto(entity);

      expect(result.doctor).toBeDefined();
      expect(result.doctor?.id).toBe(entity.doctor.id);
      expect(result.doctor?.name).toBe(entity.doctor.nama_lengkap);
    });

    it('should map patient relation when present', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toResponseDto(entity);

      expect(result.patient).toBeDefined();
      expect(result.patient?.id).toBe(entity.patient.id);
      expect(result.patient?.nama_lengkap).toBe(entity.patient.nama_lengkap);
      expect(result.patient?.no_rm).toBe(entity.patient.nomor_rekam_medis);
      expect(result.patient?.tanggal_lahir).toEqual(entity.patient.tanggal_lahir);
    });

    it('should handle missing relations gracefully', () => {
      const entity: Partial<MedicalRecord> = createMockMedicalRecord();

      entity.appointment = undefined;
      entity.doctor = undefined;
      entity.patient = undefined;

      const result = mapper.toResponseDto(entity as MedicalRecord);

      expect(result.appointment).toBeUndefined();
      expect(result.doctor).toBeUndefined();
      expect(result.patient).toBeUndefined();
    });

    it('should handle deleted_at timestamp', () => {
      const entity = createMockMedicalRecord();
      entity.deleted_at = new Date('2024-01-20T10:00:00Z');

      const result = mapper.toResponseDto(entity);

      expect(result.deleted_at).toEqual(entity.deleted_at);
    });
  });

  // ==========================================================================
  // TO RESPONSE DTO ARRAY TESTS
  // ==========================================================================
  describe('toResponseDtoArray', () => {
    it('should map array of entities to array of DTOs', () => {
      const entities: MedicalRecord[] = [
        createMockMedicalRecord(),
        Object.assign(new MedicalRecord(), createMockMedicalRecord(), { id: 2 }),
        Object.assign(new MedicalRecord(), createMockMedicalRecord(), { id: 3 }),
      ];

      const result = mapper.toResponseDtoArray(entities);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle empty array', () => {
      const result = mapper.toResponseDtoArray([]);
      expect(result).toEqual([]);
    });

    it('should map all entities correctly', () => {
      const entities = [createMockMedicalRecord()];
      const result = mapper.toResponseDtoArray(entities);

      expect(result[0]).toBeInstanceOf(MedicalRecordResponseDto);
      expect(result[0].id).toBe(entities[0].id);
    });
  });

  // ==========================================================================
  // TO ENTITY TESTS
  // ==========================================================================
  describe('toEntity', () => {
    it('should map CreateDto to entity', () => {
      const dto = createMockCreateDto();
      const userId = 2;

      const result = mapper.toEntity(dto, userId);

      expect(result.appointment_id).toBe(dto.appointment_id);
      expect(result.doctor_id).toBe(userId);
    });

    it('should trim SOAP fields', () => {
      const dto = createMockCreateDto();
      const userId = 2;

      const result = mapper.toEntity(dto, userId);

      expect(result.subjektif).toBe('Pasien mengeluh sakit kepala');
      expect(result.objektif).toBe('TD: 120/80');
      expect(result.assessment).toBe('Tension headache');
      expect(result.plan).toBe('Istirahat cukup');
    });

    it('should handle undefined SOAP fields', () => {
      const dto = {
        appointment_id: 10,
        user_id_staff: 2,
      } as CreateMedicalRecordDto;
      const userId = 2;

      const result = mapper.toEntity(dto, userId);

      expect(result.subjektif).toBeUndefined();
      expect(result.objektif).toBeUndefined();
      expect(result.assessment).toBeUndefined();
      expect(result.plan).toBeUndefined();
    });

    it('should handle empty string SOAP fields', () => {
      const dto = {
        appointment_id: 10,
        user_id_staff: 2,
        subjektif: '',
        objektif: '',
        assessment: '',
        plan: '',
      } as CreateMedicalRecordDto;
      const userId = 2;

      const result = mapper.toEntity(dto, userId);

      expect(result.subjektif).toBeUndefined();
      expect(result.objektif).toBeUndefined();
      expect(result.assessment).toBeUndefined();
      expect(result.plan).toBeUndefined();
    });
  });

  // ==========================================================================
  // TO UPDATE ENTITY TESTS
  // ==========================================================================
  describe('toUpdateEntity', () => {
    it('should map UpdateDto to partial entity', () => {
      const dto = createMockUpdateDto();
      const result = mapper.toUpdateEntity(dto);

      expect(result.subjektif).toBe('Updated subjektif');
      expect(result.objektif).toBe('Updated objektif');
      expect(result.assessment).toBe('Updated assessment');
      expect(result.plan).toBe('Updated plan');
    });

    it('should only include defined fields', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'New subjektif',
      };

      const result = mapper.toUpdateEntity(dto);

      expect(result.subjektif).toBe('New subjektif');
      expect(result.objektif).toBeUndefined();
      expect(result.assessment).toBeUndefined();
      expect(result.plan).toBeUndefined();
    });

    it('should trim updated fields', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '  New subjektif  ',
        objektif: '  New objektif  ',
      };

      const result = mapper.toUpdateEntity(dto);

      expect(result.subjektif).toBe('New subjektif');
      expect(result.objektif).toBe('New objektif');
    });

    it('should handle empty string as undefined', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '',
        objektif: '',
      };

      const result = mapper.toUpdateEntity(dto);

      expect(result.subjektif).toBeUndefined();
      expect(result.objektif).toBeUndefined();
    });

    it('should handle whitespace-only strings', () => {
      const dto: UpdateMedicalRecordDto = {
        subjektif: '   ',
        objektif: '   ',
      };

      const result = mapper.toUpdateEntity(dto);

      expect(result.subjektif).toBeUndefined();
      expect(result.objektif).toBeUndefined();
    });
  });

  // ==========================================================================
  // TO MINIMAL RESPONSE TESTS
  // ==========================================================================
  describe('toMinimalResponse', () => {
    it('should return only essential fields', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toMinimalResponse(entity);

      expect(result.id).toBe(entity.id);
      expect(result.appointment_id).toBe(entity.appointment_id);
      expect(result.subjektif).toBe(entity.subjektif);
      expect(result.objektif).toBe(entity.objektif);
      expect(result.assessment).toBe(entity.assessment);
      expect(result.plan).toBe(entity.plan);
      expect(result.created_at).toEqual(entity.created_at);
      expect(result.updated_at).toEqual(entity.updated_at);
    });

    it('should not include relations', () => {
      const entity = createMockMedicalRecord();
      const result = mapper.toMinimalResponse(entity);

      expect(result.appointment).toBeUndefined();
      expect(result.doctor).toBeUndefined();
      expect(result.patient).toBeUndefined();
    });

    it('should work with minimal entity data', () => {
      const entity = {
        id: 1,
        appointment_id: 10,
        subjektif: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      } as MedicalRecord;

      const result = mapper.toMinimalResponse(entity);

      expect(result.id).toBe(1);
      expect(result.appointment_id).toBe(10);
    });
  });

  // ==========================================================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle entity with all null SOAP fields', () => {
      const entity = createMockMedicalRecord();
      entity.subjektif = null;
      entity.objektif = null;
      entity.assessment = null;
      entity.plan = null;

      const result = mapper.toResponseDto(entity);

      expect(result.subjektif).toBeNull();
      expect(result.objektif).toBeNull();
      expect(result.assessment).toBeNull();
      expect(result.plan).toBeNull();
    });

    it('should handle very long SOAP fields', () => {
      const longText = 'A'.repeat(5000);
      const entity = createMockMedicalRecord();
      entity.subjektif = longText;

      const result = mapper.toResponseDto(entity);

      expect(result.subjektif).toBe(longText);
      expect(result.subjektif.length).toBe(5000);
    });

    it('should handle special characters in SOAP fields', () => {
      const entity = createMockMedicalRecord();
      entity.subjektif = 'Test with "quotes" and \'apostrophes\'';
      entity.objektif = 'Test with <html> tags';

      const result = mapper.toResponseDto(entity);

      expect(result.subjektif).toBe('Test with "quotes" and \'apostrophes\'');
      expect(result.objektif).toBe('Test with <html> tags');
    });
  });
});