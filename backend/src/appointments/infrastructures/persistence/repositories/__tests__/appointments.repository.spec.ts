import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, EntityManager } from 'typeorm';
import { AppointmentsRepository } from '../appointments.repository';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../domains/entities/appointment.entity';
import { Patient } from '../../../../../patients/domains/entities/patient.entity';
import { User } from '../../../../../users/domains/entities/user.entity';

describe('AppointmentsRepository', () => {
  let repository: AppointmentsRepository;
  let appointmentRepo: jest.Mocked<Repository<Appointment>>;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    entityManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: entityManager,
    } as any;

    const mockAppointmentRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockPatientRepo = {
      findOne: jest.fn(),
    };

    const mockUserRepo = {
      findOne: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn(() => queryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsRepository,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepo,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    appointmentRepo = module.get(getRepositoryToken(Appointment));
    patientRepo = module.get(getRepositoryToken(Patient));
    userRepo = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
  });

  describe('createQueryRunner', () => {
    it('should create and return query runner', () => {
      const result = repository.createQueryRunner();

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(result).toBe(queryRunner);
    });
  });

  describe('findById', () => {
    it('should find appointment by ID with relations', async () => {
      const mockAppointment = { id: 1 } as Appointment;
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);

      const result = await repository.findById(1);

      expect(appointmentRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['patient', 'doctor', 'doctor.roles', 'medical_record'],
      });
      expect(result).toBe(mockAppointment);
    });

    it('should return null when appointment not found', async () => {
      appointmentRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByIdInTransaction', () => {
    it('should find appointment in transaction', async () => {
      const mockAppointment = { id: 1 } as Appointment;
      entityManager.findOne.mockResolvedValue(mockAppointment);

      const result = await repository.findByIdInTransaction(queryRunner, 1);

      expect(entityManager.findOne).toHaveBeenCalledWith(Appointment, {
        where: { id: 1 },
        relations: ['patient', 'doctor', 'doctor.roles', 'medical_record'],
      });
      expect(result).toBe(mockAppointment);
    });

    it('should return null when not found in transaction', async () => {
      entityManager.findOne.mockResolvedValue(null);

      const result = await repository.findByIdInTransaction(queryRunner, 999);

      expect(result).toBeNull();
    });
  });

  describe('findPatientById', () => {
    it('should find patient by ID', async () => {
      const mockPatient = { id: 10 } as Patient;
      patientRepo.findOne.mockResolvedValue(mockPatient);

      const result = await repository.findPatientById(10);

      expect(patientRepo.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(result).toBe(mockPatient);
    });

    it('should return null when patient not found', async () => {
      patientRepo.findOne.mockResolvedValue(null);

      const result = await repository.findPatientById(999);

      expect(result).toBeNull();
    });
  });

  describe('findPatientByIdInTransaction', () => {
    it('should find patient in transaction', async () => {
      const mockPatient = { id: 10 } as Patient;
      entityManager.findOne.mockResolvedValue(mockPatient);

      const result = await repository.findPatientByIdInTransaction(
        queryRunner,
        10,
      );

      expect(entityManager.findOne).toHaveBeenCalledWith(Patient, {
        where: { id: 10 },
      });
      expect(result).toBe(mockPatient);
    });
  });

  describe('findDoctorById', () => {
    it('should find doctor by ID with roles', async () => {
      const mockDoctor = { id: 5 } as User;
      userRepo.findOne.mockResolvedValue(mockDoctor);

      const result = await repository.findDoctorById(5);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
        relations: ['roles'],
      });
      expect(result).toBe(mockDoctor);
    });

    it('should return null when doctor not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await repository.findDoctorById(999);

      expect(result).toBeNull();
    });
  });

  describe('findDoctorByIdInTransaction', () => {
    it('should find doctor in transaction with roles', async () => {
      const mockDoctor = { id: 5 } as User;
      entityManager.findOne.mockResolvedValue(mockDoctor);

      const result = await repository.findDoctorByIdInTransaction(
        queryRunner,
        5,
      );

      expect(entityManager.findOne).toHaveBeenCalledWith(User, {
        where: { id: 5 },
        relations: ['roles'],
      });
      expect(result).toBe(mockDoctor);
    });
  });

  describe('save', () => {
    it('should save appointment', async () => {
      const mockAppointment = { id: 1 } as Appointment;
      appointmentRepo.save.mockResolvedValue(mockAppointment);

      const result = await repository.save(mockAppointment);

      expect(appointmentRepo.save).toHaveBeenCalledWith(mockAppointment);
      expect(result).toBe(mockAppointment);
    });
  });

  describe('saveInTransaction', () => {
    it('should create and save appointment in transaction', async () => {
      const appointmentData: Partial<Appointment> = {
        patient_id: 10,
        doctor_id: 5,
        tanggal_janji: new Date(),
      };

      const createdEntity: Appointment = {
        id: 1,
        ...appointmentData,
      } as Appointment;
      const savedEntity: Appointment = {
        id: 1,
        ...appointmentData,
      } as Appointment;

      // Mock queryRunner.manager
      const queryRunner = {
        manager: {
          create: jest.fn().mockReturnValue(createdEntity),
          save: jest.fn().mockResolvedValue(savedEntity),
        },
      } as unknown as QueryRunner;

      const result = await repository.saveInTransaction(
        queryRunner,
        appointmentData,
      );

      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Appointment,
        appointmentData,
      );
      expect(queryRunner.manager.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe(savedEntity);
    });
  });

  describe('updateInTransaction', () => {
    it('should update appointment in transaction', async () => {
      const mockAppointment = {
        id: 1,
        status: AppointmentStatus.SELESAI,
      } as Appointment;
      entityManager.save.mockResolvedValue(mockAppointment);

      const result = await repository.updateInTransaction(
        queryRunner,
        mockAppointment,
      );

      expect(entityManager.save).toHaveBeenCalledWith(mockAppointment);
      expect(result).toBe(mockAppointment);
    });
  });

  describe('remove', () => {
    it('should remove appointment', async () => {
      const mockAppointment = { id: 1 } as Appointment;
      appointmentRepo.remove.mockResolvedValue(mockAppointment);

      await repository.remove(mockAppointment);

      expect(appointmentRepo.remove).toHaveBeenCalledWith(mockAppointment);
    });
  });

  describe('createQueryBuilder', () => {
    it('should create query builder with default alias', () => {
      const mockQueryBuilder = {} as any;
      appointmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = repository.createQueryBuilder();

      expect(appointmentRepo.createQueryBuilder).toHaveBeenCalledWith(
        'appointment',
      );
      expect(result).toBe(mockQueryBuilder);
    });

    it('should create query builder with custom alias', () => {
      const mockQueryBuilder = {} as any;
      appointmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = repository.createQueryBuilder('appt');

      expect(appointmentRepo.createQueryBuilder).toHaveBeenCalledWith('appt');
      expect(result).toBe(mockQueryBuilder);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete transaction flow', async () => {
      const appointmentData = { patient_id: 10 } as Partial<Appointment>;
      const savedAppointment = { id: 1, ...appointmentData } as Appointment;

      const qr = {
        manager: {
          create: jest.fn().mockReturnValue(savedAppointment),
          save: jest.fn().mockResolvedValue(savedAppointment),
        },
      } as unknown as QueryRunner;

      const result = await repository.saveInTransaction(qr, appointmentData);

      expect(result).toBe(savedAppointment);
      expect(qr.manager.create).toHaveBeenCalledWith(
        Appointment,
        appointmentData,
      );
      expect(qr.manager.save).toHaveBeenCalledWith(savedAppointment);
    });

    it('should handle finding related entities', async () => {
      const mockAppointment = {
        id: 1,
        patient_id: 10,
        doctor_id: 5,
      } as Appointment;
      const mockPatient = { id: 10 } as Patient;
      const mockDoctor = { id: 5 } as User;

      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      patientRepo.findOne.mockResolvedValue(mockPatient);
      userRepo.findOne.mockResolvedValue(mockDoctor);

      const appointment = await repository.findById(1);
      const patient = await repository.findPatientById(10);
      const doctor = await repository.findDoctorById(5);

      expect(appointment).toBe(mockAppointment);
      expect(patient).toBe(mockPatient);
      expect(doctor).toBe(mockDoctor);
    });
  });
});
