import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { MedicalRecordsRepository } from '../medical-records.repository';
import { MedicalRecord } from '../../../../domains/entities/medical-record.entity';
import { Appointment } from '../../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../../patients/domains/entities/patient.entity';

describe('MedicalRecordsRepository', () => {
  let repository: MedicalRecordsRepository;
  let typeOrmRepository: Repository<MedicalRecord>;

  // ==================== MOCK DATA ====================
  const mockMedicalRecord = Object.assign(new MedicalRecord(), {
    id: 1,
    appointment_id: 1,
    patient_id: 1,
    doctor_id: 1,
    subjektif: 'Test subjektif',
    objektif: 'Test objektif',
    assessment: 'Test assessment',
    plan: 'Test plan',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    appointment: {} as Appointment,
    doctor: {} as User,
    patient: {} as Patient,
  });

  function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const clone = { ...obj };
    for (const key of keys) delete clone[key];
    return clone;
  }

  const mockMedicalRecords: MedicalRecord[] = [
    makeRecord(),
    makeRecord({ id: 2, patient_id: 2 }),
  ];

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  function makeRecord(data: Partial<MedicalRecord> = {}): MedicalRecord {
    return Object.assign(new MedicalRecord(), {
      id: 1,
      appointment_id: 1,
      doctor_id: 1,
      patient_id: 1,
      subjektif: null,
      objektif: null,
      assessment: null,
      plan: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      appointment: {} as Appointment,
      doctor: {} as User,
      patient: {} as Patient,
      ...data,
    });
  }


  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsRepository,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get<MedicalRecordsRepository>(MedicalRecordsRepository);
    typeOrmRepository = module.get<Repository<MedicalRecord>>(
      getRepositoryToken(MedicalRecord),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== FIND BY APPOINTMENT ID TESTS ====================
  describe('findByAppointmentId', () => {
    it('should find medical record by appointment ID', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await repository.findByAppointmentId(1);

      expect(result).toEqual(mockMedicalRecord);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { appointment_id: 1 },
        relations: ['appointment', 'doctor', 'patient'],
      });
    });

    it('should return null when not found', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findByAppointmentId(999);

      expect(result).toBeNull();
    });

    it('should include relations', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await repository.findByAppointmentId(1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: expect.arrayContaining(['appointment', 'doctor', 'patient']),
        }),
      );
    });
  });

  // ==================== FIND BY PATIENT ID TESTS ====================
  describe('findByPatientId', () => {
    it('should find all records for a patient', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.findByPatientId(1);

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { patient_id: 1 },
        relations: ['appointment', 'doctor'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no records found', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue([]);

      const result = await repository.findByPatientId(999);

      expect(result).toEqual([]);
    });

    it('should order by created_at DESC', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      await repository.findByPatientId(1);

      expect(typeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { created_at: 'DESC' },
        }),
      );
    });
  });

  // ==================== FIND BY DOCTOR ID TESTS ====================
  describe('findByDoctorId', () => {
    it('should find all records for a doctor', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.findByDoctorId(1);

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { doctor_id: 1 },
        relations: ['appointment', 'patient'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no records found', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue([]);

      const result = await repository.findByDoctorId(999);

      expect(result).toEqual([]);
    });
  });

  // ==================== FIND BY DATE RANGE TESTS ====================
  describe('findByDateRange', () => {
    it('should find records within date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.findByDateRange(startDate, endDate);

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          created_at: Between(startDate, endDate),
        },
        relations: ['appointment', 'patient', 'doctor'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no records in range', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue([]);

      const result = await repository.findByDateRange(
        new Date('2020-01-01'),
        new Date('2020-12-31'),
      );

      expect(result).toEqual([]);
    });
  });

  // ==================== COUNT TESTS ====================
  describe('countByPatientId', () => {
    it('should count records for patient', async () => {
      jest.spyOn(typeOrmRepository, 'count').mockResolvedValue(5);

      const result = await repository.countByPatientId(1);

      expect(result).toBe(5);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { patient_id: 1 },
      });
    });

    it('should return 0 when no records', async () => {
      jest.spyOn(typeOrmRepository, 'count').mockResolvedValue(0);

      const result = await repository.countByPatientId(999);

      expect(result).toBe(0);
    });
  });

  describe('countByDoctorId', () => {
    it('should count records for doctor', async () => {
      jest.spyOn(typeOrmRepository, 'count').mockResolvedValue(10);

      const result = await repository.countByDoctorId(1);

      expect(result).toBe(10);
      expect(typeOrmRepository.count).toHaveBeenCalledWith({
        where: { doctor_id: 1 },
      });
    });
  });

  // ==================== FIND INCOMPLETE TESTS ====================
  describe('findIncomplete', () => {
    it('should find incomplete records', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockMedicalRecords);

      const result = await repository.findIncomplete();

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should check for missing SOAP fields', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findIncomplete();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('subjektif IS NULL'),
      );
    });

    it('should include relations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findIncomplete();

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.appointment',
        'appointment',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.patient',
        'patient',
      );
    });
  });

  // ==================== SEARCH IN SOAP TESTS ====================
  describe('searchInSOAP', () => {
    it('should search in SOAP fields', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockMedicalRecords);

      const result = await repository.searchInSOAP('demam');

      expect(result).toEqual(mockMedicalRecords);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.objectContaining({ search: '%demam%' }),
      );
    });

    it('should search across all SOAP fields', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.searchInSOAP('test');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('subjektif LIKE'),
        expect.any(Object),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('objektif LIKE'),
        expect.any(Object),
      );
    });

    it('should include all relations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.searchInSOAP('test');

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== GET RECENT RECORDS TESTS ====================
  describe('getRecentRecords', () => {
    it('should get recent records with default parameters', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.getRecentRecords();

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should accept custom days parameter', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      await repository.getRecentRecords(30, 10);

      expect(typeOrmRepository.find).toHaveBeenCalled();
    });

    it('should accept custom limit parameter', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      await repository.getRecentRecords(7, 20);

      expect(typeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        }),
      );
    });
  });

  // ==================== BULK INSERT TESTS ====================
  describe('bulkInsert', () => {
    it('should insert multiple records', async () => {
      const recordsToInsert = [
        { appointment_id: 1, patient_id: 1, doctor_id: 1 },
        { appointment_id: 2, patient_id: 2, doctor_id: 1 },
      ];

      jest.spyOn(typeOrmRepository, 'create').mockReturnValue(mockMedicalRecords as any);
      jest.spyOn(typeOrmRepository, 'save').mockResolvedValue(mockMedicalRecords as any);

      const result = await repository.bulkInsert(recordsToInsert);

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.create).toHaveBeenCalledWith(recordsToInsert);
      expect(typeOrmRepository.save).toHaveBeenCalled();
    });

    it('should handle empty array', async () => {
      jest.spyOn(typeOrmRepository, 'create').mockReturnValue([] as any);
      jest.spyOn(typeOrmRepository, 'save').mockResolvedValue([] as any);

      const result = await repository.bulkInsert([]);

      expect(result).toEqual([]);
    });
  });

  // ==================== GET STATISTICS TESTS ====================
  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const records = [
        makeRecord({
          doctor_id: 1,
          subjektif: 'a',
          objektif: 'b',
          assessment: 'c',
          plan: 'd',
        }),
        makeRecord({
          id: 2,
          doctor_id: 2,
          subjektif: '',
        }),
      ];

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(records);

      const result = await repository.getStatistics();

      expect(result.total).toBe(2);
      expect(result.complete).toBe(1);
      expect(result.incomplete).toBe(1);
      expect(result.byDoctor[1]).toBe(1);
      expect(result.byDoctor[2]).toBe(1);
    });


    it('should handle date range', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue([]);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      await repository.getStatistics(startDate, endDate);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          created_at: Between(startDate, endDate),
        },
      });
    });

    it('should count complete and incomplete correctly', async () => {
      const records: MedicalRecord[] = [
        makeRecord({
          subjektif: 'a',
          objektif: 'b',
          assessment: 'c',
          plan: 'd',
        }),
        makeRecord({
          id: 2,
          subjektif: null,
        }),
        makeRecord({
          id: 3,
          objektif: null,
        }),
      ];

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(records);

      const result = await repository.getStatistics();

      expect(result.complete).toBe(1);
      expect(result.incomplete).toBe(2);
    });

    it('should aggregate by doctor correctly', async () => {
      const records: MedicalRecord[] = [
        makeRecord({ doctor_id: 1 }),
        makeRecord({ id: 2, doctor_id: 1 }),
        makeRecord({ id: 3, doctor_id: 2 }),
      ];

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(records);

      const result = await repository.getStatistics();

      expect(result.byDoctor[1]).toBe(2);
      expect(result.byDoctor[2]).toBe(1);
    });
  });

  // ==================== FIND WITH CONDITIONS TESTS ====================
  describe('findWithConditions', () => {
    it('should find records with custom conditions', async () => {
      const conditions = { patient_id: 1, doctor_id: 1 };
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.findWithConditions(conditions);

      expect(result).toEqual(mockMedicalRecords);
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: conditions,
        relations: ['appointment', 'patient', 'doctor'],
        order: { created_at: 'DESC' },
      });
    });

    it('should handle array of conditions', async () => {
      const conditions = [{ patient_id: 1 }, { patient_id: 2 }];
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockMedicalRecords);

      const result = await repository.findWithConditions(conditions);

      expect(result).toEqual(mockMedicalRecords);
    });
  });
});