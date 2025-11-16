import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from '../seeder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
// [FIX] Impor ObjectLiteral dan Repository
import { Repository, ObjectLiteral } from 'typeorm';
import { Role, UserRole } from '../../roles/entities/role.entity';
import { User } from '../../users/domains/entities/user.entity';
import { Patient, Gender } from '../../patients/domains/entities/patient.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../appointments/domains/entities/appointment.entity';
// [FIX] Menggunakan path relatif agar konsisten dengan service
import { MedicalRecord } from '../../medical_records/domains/entities/medical-record.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

// Mock 'bcrypt'
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// [FIX] Memperbarui tipe MockRepository untuk memenuhi constraint ObjectLiteral
type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('SeederService', () => {
  let service: SeederService;
  let mockRoleRepo: MockRepository<Role>;
  let mockUserRepo: MockRepository<User>;
  let mockPatientRepo: MockRepository<Patient>;
  let mockAppointmentRepo: MockRepository<Appointment>;
  let mockMedicalRecordRepo: MockRepository<MedicalRecord>;

  const loggerSpies = {
    log: jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { }),
    error: jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { }),
  };

  // DATA MOCK
  const mockRoles = [
    { id: 1, name: UserRole.KEPALA_KLINIK },
    { id: 2, name: UserRole.DOKTER },
    { id: 3, name: UserRole.STAF },
  ];
  const mockDokter = { id: 1, username: 'anisa.putri' };
  const mockPatient = { id: 1, nik: '3201012345678901' };
  const mockSavedAppt = [
    { id: 1, status: AppointmentStatus.SELESAI },
  ];

  beforeEach(async () => {
    mockRoleRepo = {
      find: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };
    mockUserRepo = {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    mockPatientRepo = {
      find: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };
    mockAppointmentRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };
    mockMedicalRecordRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepo,
        },
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockMedicalRecordRepo,
        },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);

    jest.clearAllMocks();
    // [FIX] Mengatasi error tipe 'never'
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('mocked_hashed_password');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed (Happy Path)', () => {
    it('should seed all entities if database is empty', async () => {
      // --- ARRANGE ---
      // [FIX] Menggunakan '!' untuk mengatasi 'possibly undefined'
      mockRoleRepo.find!.mockResolvedValue([]);
      mockUserRepo.find!.mockResolvedValue([]);
      mockPatientRepo.find!.mockResolvedValue([]);
      mockAppointmentRepo.find!.mockResolvedValue([]);

      mockRoleRepo.findOneBy!.mockImplementation((query: any) => {
        if (query.name === UserRole.KEPALA_KLINIK)
          return Promise.resolve(mockRoles[0]);
        if (query.name === UserRole.DOKTER)
          return Promise.resolve(mockRoles[1]);
        if (query.name === UserRole.STAF) return Promise.resolve(mockRoles[2]);
        return Promise.resolve(undefined);
      });

      mockUserRepo.findOne!.mockResolvedValue(mockDokter);
      mockPatientRepo.findOneBy!.mockResolvedValue(mockPatient);
      mockAppointmentRepo.save!.mockResolvedValue(mockSavedAppt);

      // --- ACT ---
      await service.seed();

      // --- ASSERT ---
      expect(mockRoleRepo.find).toHaveBeenCalledTimes(1);
      expect(mockRoleRepo.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      expect(mockPatientRepo.find).toHaveBeenCalledTimes(1);
      expect(mockPatientRepo.save).toHaveBeenCalledTimes(1);
      expect(mockAppointmentRepo.find).toHaveBeenCalledTimes(1);
      expect(mockAppointmentRepo.save).toHaveBeenCalledTimes(1);
      expect(mockMedicalRecordRepo.save).toHaveBeenCalledTimes(1);
      expect(loggerSpies.log).toHaveBeenCalledWith(
        '✅ Seeding completed successfully',
      );
      expect(loggerSpies.error).not.toHaveBeenCalled();
    });
  });

  describe('seed (Idempotency)', () => {
    it('should skip seeding if data already exists', async () => {
      // --- ARRANGE ---
      mockRoleRepo.find!.mockResolvedValue([mockRoles[0]]);
      mockUserRepo.find!.mockResolvedValue([mockDokter as User]);
      mockPatientRepo.find!.mockResolvedValue([mockPatient as Patient]);
      mockAppointmentRepo.find!.mockResolvedValue([
        mockSavedAppt[0] as Appointment,
      ]);

      // --- ACT ---
      await service.seed();

      // --- ASSERT ---
      expect(mockRoleRepo.save).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
      expect(mockPatientRepo.save).not.toHaveBeenCalled();
      expect(mockAppointmentRepo.save).not.toHaveBeenCalled();
      expect(mockMedicalRecordRepo.save).not.toHaveBeenCalled();

      // [PERBAIKAN UTAMA] Sesuaikan string agar SAMA PERSIS dengan log service
      // (termasuk emoji dan DUA spasi)
      expect(loggerSpies.log).toHaveBeenCalledWith(
        '⏭️  Roles already exist, skipping...',
      );
      expect(loggerSpies.log).toHaveBeenCalledWith(
        '⏭️  Users already exist, skipping...',
      );
      expect(loggerSpies.log).toHaveBeenCalledWith(
        '⏭️  Patients already exist, skipping...',
      );
      expect(loggerSpies.log).toHaveBeenCalledWith(
        '⏭️  Appointments already exist, skipping...',
      );

      expect(loggerSpies.log).toHaveBeenCalledWith(
        '✅ Seeding completed successfully',
      );
    });
  });

  describe('seed (Error Handling)', () => {
    it('should throw and log error if roles are not found when seeding users', async () => {
      // --- ARRANGE ---
      mockRoleRepo.find!.mockResolvedValue([]);
      mockUserRepo.find!.mockResolvedValue([]);
      mockRoleRepo.findOneBy!.mockResolvedValue(undefined);

      const expectedError = new Error(
        'Roles not found. Please run role seeding first.',
      );

      // --- ACT & ASSERT ---
      await expect(service.seed()).rejects.toThrow(expectedError);

      expect(loggerSpies.error).toHaveBeenCalledWith(
        '❌ Error seeding users:',
        expectedError,
      );
      expect(loggerSpies.error).toHaveBeenCalledWith(
        '❌ Seeding failed:',
        expectedError,
      );
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });
});