import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsController } from './medical_records.controller';
import { MedicalRecordsService } from '../../applications/orchestrator/medical_records.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '../../../users/domains/entities/user.entity';
import { CreateMedicalRecordDto } from '../../applications/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../../applications/dto/update-medical-record.dto';
import { SearchMedicalRecordDto } from '../../applications/dto/search-medical-record.dto';
import { MedicalRecordResponseDto } from '../../applications/dto/medical-record-response.dto';
import { UserRole } from '../../../roles/entities/role.entity'; // Diperlukan untuk mock user
import { AppointmentStatus } from '../../../appointments/domains/entities/appointment.entity';

describe('MedicalRecordsController', () => {
  let controller: MedicalRecordsController;

  // ======================
  // MOCK ALL DEPENDENCIES
  // ======================

  const mockMedicalRecordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByAppointmentId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
  };

  // Mock User untuk @GetUser() decorator
  const mockUser: User = {
    id: 1,
    nama_lengkap: 'Dr. John Doe',
    username: 'john.doe',
    password: 'hashedpassword',
    created_at: new Date(),
    updated_at: new Date(),
    profile_photo: 'http://example.com/photo.jpg',
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor role' }],
    medical_records: [
      {
        id: 1,
        appointment_id: 1,
        doctor_id: 1,
        patient_id: 1,
        subjektif: 'Subjektif contoh',
        objektif: 'Objektif contoh',
        assessment: 'Assessment contoh',
        plan: 'Plan contoh',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // Diperlukan untuk CacheInterceptor
      controllers: [MedicalRecordsController],
      providers: [
        {
          provide: MedicalRecordsService,
          useValue: mockMedicalRecordsService,
        },
        // Mock semua guards
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: ThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      // Override guards
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MedicalRecordsController>(
      MedicalRecordsController,
    );
  });

  // Reset mocks setelah setiap tes
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES UNTUK SETIAP ENDPOINT
  // ------------------------------------

  describe('create', () => {
    it('should create a new medical record', async () => {
      // Asumsikan DTO dan Response memiliki properti ini
      const createDto: CreateMedicalRecordDto = {
        appointment_id: 1,
        user_id_staff: 1,
        subjektif: 'Pasien mengeluh sakit gigi',
        objektif: 'Gigi berlubang pada gigi molar',
        assessment: 'Karies gigi',
        plan: 'Penambalan gigi',
      } as CreateMedicalRecordDto;

      const expectedResult: MedicalRecordResponseDto = {
        id: 1,
        appointment_id: createDto.appointment_id,
        doctor_id: 2,
        patient_id: 3,
        subjektif: createDto.subjektif,
        objektif: createDto.objektif,
        assessment: createDto.assessment,
        plan: createDto.plan,
        created_at: new Date(),
        updated_at: new Date(),
        umur_rekam: 30,
        appointment: {
          id: 1,
          appointment_date: new Date(),
          status: AppointmentStatus.DIJADWALKAN,
          patient: { id: 3, nama_lengkap: 'Jane Doe', no_rm: 'RM123' },
        },
        doctor: { id: 2, name: 'Dr. John Doe' },
        patient: { id: 3, nama_lengkap: 'Jane Doe', no_rm: 'RM123', tanggal_lahir: new Date('1993-01-01') },

      } as MedicalRecordResponseDto;

      mockMedicalRecordsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.create).toHaveBeenCalledWith(
        createDto,
        mockUser,
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of medical records', async () => {
      const query: SearchMedicalRecordDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockMedicalRecordsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.findAll).toHaveBeenCalledWith(
        mockUser,
        query,
      );
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const filters: SearchMedicalRecordDto = {
        search: 'sakit gigi',
        doctor_id: 2,
        patient_id: 3,
        appointment_id: 4,
        appointment_status: AppointmentStatus.SELESAI,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC',
      };
      const expectedResult: MedicalRecordResponseDto[] = [];

      mockMedicalRecordsService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(filters, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.search).toHaveBeenCalledWith(
        filters,
        mockUser,
      );
    });
  });

  describe('findByAppointmentId', () => {
    it('should return a medical record by appointment ID', async () => {
      const appointmentId = 123;
      const expectedResult: MedicalRecordResponseDto = {
        id: 1,
        appointment_id: appointmentId,
      } as MedicalRecordResponseDto;

      mockMedicalRecordsService.findByAppointmentId.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByAppointmentId(appointmentId, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.findByAppointmentId).toHaveBeenCalledWith(
        appointmentId,
        mockUser,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single medical record by ID', async () => {
      const id = 1;
      const expectedResult: MedicalRecordResponseDto = {
        id: 1,
        appointment_id: 2,
        doctor_id: 3,
        patient_id: 4,
        subjektif: 'Subjektif contoh',
        objektif: 'Objektif contoh',
        assessment: 'Assessment contoh',
        plan: 'Plan contoh',
        created_at: new Date(),
        updated_at: new Date(),
        umur_rekam: 25,
        appointment: {
          id: 1,
          appointment_date: new Date(),
          status: AppointmentStatus.DIJADWALKAN,
          patient: { id: 4, nama_lengkap: 'Patient Name', no_rm: 'RM456' },
        },
        doctor: { id: 3, name: 'Dr. Example' },
        patient: { id: 4, nama_lengkap: 'Patient Name', no_rm: 'RM456', tanggal_lahir: new Date('1998-05-15') }
      } as MedicalRecordResponseDto;

      mockMedicalRecordsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.findOne).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('update', () => {
    it('should update a medical record', async () => {
      const id = 1;
      const updateDto: UpdateMedicalRecordDto = {
        subjektif: 'Pasien melaporkan nyeri berkurang',
        objektif: 'Gigi tampak lebih bersih',
        assessment: 'Perbaikan karies',
        plan: 'Lanjutkan perawatan rutin',
      } as UpdateMedicalRecordDto;
      const expectedResult: MedicalRecordResponseDto = {
        id: 1,
        appointment_id: 1,
        doctor_id: 2,
        patient_id: 3,
        subjektif: updateDto.subjektif,
        objektif: updateDto.objektif,
        assessment: updateDto.assessment,
        plan: updateDto.plan,
        created_at: new Date(),
        updated_at: new Date(),
        umur_rekam: 30,
        appointment: {
          id: 1,
          appointment_date: new Date(),
          status: AppointmentStatus.DIJADWALKAN,
          patient: { id: 3, nama_lengkap: 'Jane Doe', no_rm: 'RM123' },
        },
        doctor: { id: 2, name: 'Dr. John Doe' },
        patient: { id: 3, nama_lengkap: 'Jane Doe', no_rm: 'RM123', tanggal_lahir: new Date('1993-01-01') },
      } as MedicalRecordResponseDto;

      mockMedicalRecordsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockMedicalRecordsService.update).toHaveBeenCalledWith(
        id,
        updateDto,
        mockUser,
      );
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete a medical record and return a message', async () => {
      const id = 1;
      mockMedicalRecordsService.remove.mockResolvedValue(undefined); // Service return void

      const result = await controller.remove(id, mockUser);

      expect(result).toEqual({ message: 'Rekam medis berhasil dihapus' });
      expect(mockMedicalRecordsService.remove).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('restore', () => {
    it('should restore a medical record and return a message', async () => {
      const id = 1;
      mockMedicalRecordsService.restore.mockResolvedValue(undefined); // Service return void

      const result = await controller.restore(id, mockUser);

      expect(result).toEqual({ message: 'Rekam medis berhasil dipulihkan' });
      expect(mockMedicalRecordsService.restore).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a medical record', async () => {
      const id = 1;
      mockMedicalRecordsService.hardDelete.mockResolvedValue(undefined); // Service return void

      // Controller return void
      await controller.hardDelete(id, mockUser);

      expect(mockMedicalRecordsService.hardDelete).toHaveBeenCalledWith(id, mockUser);
    });
  });
});