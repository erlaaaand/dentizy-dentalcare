import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from '../appointments.controller';
import { AppointmentsService } from '../../../applications/orchestrator/appointments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../../auth/interface/guards/roles.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { CreateAppointmentDto } from '../../../applications/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../../../applications/dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../../../applications/dto/find-appointments-query.dto';
import {
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
} from '../../../applications/dto/appointment-response.dto';
// [PENTING] Impor ini untuk mock data, sesuaikan path jika perlu
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  // [DIPERBAIKI] Mock service disesuaikan dengan method controller
  const mockAppointmentsService = {
    create: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // MOCK USER DECORATOR
  const mockUser: User = {
    id: 1,
    nama_lengkap: 'Dr. John Doe',
    username: 'john.doe',
    password: 'hashedpassword',
    created_at: new Date(),
    updated_at: new Date(),
    profile_photo: 'http://example.com/photo.jpg',
    roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor role' }],
    // ... data lain tidak diperlukan untuk mock ini
  } as User;

  // [DITAMBAHKAN] Setup Modul Testing
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // Diperlukan untuk CacheInterceptor
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
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
      ],
    })
      // Override guards
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
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
    it('should create a new appointment', async () => {
      const createDto: CreateAppointmentDto = {
        patient_id: 2,
        doctor_id: 1,
        tanggal_janji: '2025-10-10',
        jam_janji: '09:00:00',
        status: AppointmentStatus.DIJADWALKAN,
        keluhan: 'Sakit gigi',
      } as CreateAppointmentDto;

      const expectedResult: Partial<AppointmentResponseDto> = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
        patient_id: 2,
        doctor_id: 1,
      };

      mockAppointmentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('complete', () => {
    it('should complete an appointment', async () => {
      const id = 1;
      const expectedResult: Partial<AppointmentResponseDto> = {
        id: id,
        status: AppointmentStatus.SELESAI,
      };

      mockAppointmentsService.complete.mockResolvedValue(expectedResult);

      const result = await controller.complete(id, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.complete).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment', async () => {
      const id = 1;
      const expectedResult: Partial<AppointmentResponseDto> = {
        id: id,
        status: AppointmentStatus.DIBATALKAN,
      };

      mockAppointmentsService.cancel.mockResolvedValue(expectedResult);

      const result = await controller.cancel(id, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.cancel).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of appointments', async () => {
      const queryDto: FindAppointmentsQueryDto = {
        page: 1,
        limit: 10,
        date: '2025-10-10',
      };
      const expectedResult: PaginatedAppointmentResponseDto = {
        data: [
          { id: 1, patient_id: 2, doctor_id: 1 } as AppointmentResponseDto,
        ],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockAppointmentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser, queryDto);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.findAll).toHaveBeenCalledWith(
        mockUser,
        queryDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single appointment by ID', async () => {
      const id = 1;
      const expectedResult: Partial<AppointmentResponseDto> = {
        id: 1,
        patient_id: 2,
        doctor_id: 1,
      };

      mockAppointmentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, mockUser);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.findOne).toHaveBeenCalledWith(id, mockUser);
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const id = 1;
      const updateDto: UpdateAppointmentDto = {
        jam_janji: '11:00:00',
        tanggal_janji: '2025-10-11',
        status: AppointmentStatus.DIJADWALKAN,
        keluhan: 'Perubahan keluhan',
      };
      const expectedResult: Partial<AppointmentResponseDto> = {
        id: 1,
        jam_janji: '11:00:00',
        tanggal_janji: Date.now().toString() as unknown as Date,
        status: AppointmentStatus.DIJADWALKAN,
        keluhan: 'Perubahan keluhan',
      };

      mockAppointmentsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(result).toBe(expectedResult);
      expect(mockAppointmentsService.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an appointment and return a message', async () => {
      const id = 1;
      mockAppointmentsService.remove.mockResolvedValue(undefined); // Service return void

      const result = await controller.remove(id, mockUser);

      expect(result).toEqual({ message: 'Appointment berhasil dihapus' });
      expect(mockAppointmentsService.remove).toHaveBeenCalledWith(id, mockUser);
    });
  });
});