import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { AppointmentCreationService } from '../use-cases/appointment-creation.service';
import { AppointmentCompletionService } from '../use-cases/appointment-completion.service';
import { AppointmentCancellationService } from '../use-cases/appointment-cancellation.service';
import { AppointmentFindService } from '../use-cases/appointment-find.service';
import { AppointmentSearchService } from '../use-cases/appointment-search.service';
import { AppointmentUpdateService } from '../use-cases/appointment-update.service';
import { AppointmentDeletionService } from '../use-cases/appointment-deletion.service';
import { AppointmentMapper } from '../../domains/mappers/appointment.mapper';
import { User } from '../../../users/domains/entities/user.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../domains/entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../dto/find-appointments-query.dto';
import {
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
} from '../dto/appointment-response.dto';
import { UserRole } from '../../../roles/entities/role.entity';

// ------------------------------------
// MOCK OBJEK DEPENDENSI
// ------------------------------------
const mockCreationService = {
  execute: jest.fn(),
};
const mockCompletionService = {
  execute: jest.fn(),
};
const mockCancellationService = {
  execute: jest.fn(),
};
const mockFindService = {
  execute: jest.fn(),
};
const mockSearchService = {
  execute: jest.fn(),
};
const mockUpdateService = {
  execute: jest.fn(),
};
const mockDeletionService = {
  execute: jest.fn(),
};
const mockMapper = {
  toResponseDto: jest.fn(),
  toPaginatedResponse: jest.fn(),
};

// ------------------------------------
// MOCK DATA UTAMA
// ------------------------------------
const mockUser: User = {
  id: 1,
  username: 'test-user',
  roles: [{ id: 1, name: UserRole.DOKTER, description: '' }],
} as User;

const mockAppointmentEntity: Appointment = {
  id: 1,
  status: AppointmentStatus.DIJADWALKAN,
  created_at: new Date(),
  updated_at: new Date(),
  tanggal_janji: new Date('2025-10-10'),
  jam_janji: '10:00:00',
  keluhan: 'Sakit gigi',
  patient_id: 2,
  doctor_id: 1,
} as Appointment;

const mockAppointmentResponseDto: AppointmentResponseDto = {
  id: 1,
  status: AppointmentStatus.DIJADWALKAN,
  patient: { id: 2, nama_lengkap: 'Pasien Test' },
  doctor: { id: 1, nama_lengkap: 'Dokter Test' },
  // ...properti DTO lainnya
} as AppointmentResponseDto;

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: AppointmentCreationService,
          useValue: mockCreationService,
        },
        {
          provide: AppointmentCompletionService,
          useValue: mockCompletionService,
        },
        {
          provide: AppointmentCancellationService,
          useValue: mockCancellationService,
        },
        { provide: AppointmentFindService, useValue: mockFindService },
        {
          provide: AppointmentSearchService,
          useValue: mockSearchService,
        },
        { provide: AppointmentUpdateService, useValue: mockUpdateService },
        {
          provide: AppointmentDeletionService,
          useValue: mockDeletionService,
        },
        { provide: AppointmentMapper, useValue: mockMapper },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset semua mock setelah setiap tes
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES
  // ------------------------------------

  describe('create', () => {
    it('should call creationService.execute and mapper.toResponseDto', async () => {
      const createDto: CreateAppointmentDto = {
        patient_id: 2,
        doctor_id: 1,
        tanggal_janji: '2025-10-10',
        jam_janji: '10:00:00',
        keluhan: 'Sakit gigi',
      };

      // Arrange
      mockCreationService.execute.mockResolvedValue(mockAppointmentEntity);
      mockMapper.toResponseDto.mockReturnValue(mockAppointmentResponseDto);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockCreationService.execute).toHaveBeenCalledWith(createDto);
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(
        mockAppointmentEntity,
      );
      expect(result).toBe(mockAppointmentResponseDto);
    });
  });

  describe('complete', () => {
    it('should call completionService.execute and mapper.toResponseDto', async () => {
      const id = 1;
      const completedEntity = {
        ...mockAppointmentEntity,
        status: AppointmentStatus.SELESAI,
      };
      const completedDto = {
        ...mockAppointmentResponseDto,
        status: AppointmentStatus.SELESAI,
      };

      // Arrange
      mockCompletionService.execute.mockResolvedValue(completedEntity);
      mockMapper.toResponseDto.mockReturnValue(completedDto);

      // Act
      const result = await service.complete(id, mockUser);

      // Assert
      expect(mockCompletionService.execute).toHaveBeenCalledWith(id, mockUser);
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(completedEntity);
      expect(result).toBe(completedDto);
    });
  });

  describe('cancel', () => {
    it('should call cancellationService.execute and mapper.toResponseDto', async () => {
      const id = 1;
      const cancelledEntity = {
        ...mockAppointmentEntity,
        status: AppointmentStatus.DIBATALKAN,
      };
      const cancelledDto = {
        ...mockAppointmentResponseDto,
        status: AppointmentStatus.DIBATALKAN,
      };

      // Arrange
      mockCancellationService.execute.mockResolvedValue(cancelledEntity);
      mockMapper.toResponseDto.mockReturnValue(cancelledDto);

      // Act
      const result = await service.cancel(id, mockUser);

      // Assert
      expect(mockCancellationService.execute).toHaveBeenCalledWith(id, mockUser);
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(cancelledEntity);
      expect(result).toBe(cancelledDto);
    });
  });

  describe('findAll', () => {
    it('should call searchService.execute and mapper.toPaginatedResponse', async () => {
      const queryDto: FindAppointmentsQueryDto = { page: 1, limit: 10 };
      const searchResult = {
        data: [mockAppointmentEntity],
        count: 1,
        page: 1,
        limit: 10,
      };
      const paginatedResponse: PaginatedAppointmentResponseDto = {
        data: [mockAppointmentResponseDto],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      // Arrange
      mockSearchService.execute.mockResolvedValue(searchResult);
      mockMapper.toPaginatedResponse.mockReturnValue(paginatedResponse);

      // Act
      const result = await service.findAll(mockUser, queryDto);

      // Assert
      expect(mockSearchService.execute).toHaveBeenCalledWith(mockUser, queryDto);
      expect(mockMapper.toPaginatedResponse).toHaveBeenCalledWith(
        searchResult.data,
        searchResult.count,
        searchResult.page,
        searchResult.limit,
      );
      expect(result).toBe(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should call findService.execute and mapper.toResponseDto', async () => {
      const id = 1;

      // Arrange
      mockFindService.execute.mockResolvedValue(mockAppointmentEntity);
      mockMapper.toResponseDto.mockReturnValue(mockAppointmentResponseDto);

      // Act
      const result = await service.findOne(id, mockUser);

      // Assert
      expect(mockFindService.execute).toHaveBeenCalledWith(id, mockUser);
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(
        mockAppointmentEntity,
      );
      expect(result).toBe(mockAppointmentResponseDto);
    });
  });

  describe('update', () => {
    it('should call updateService.execute and mapper.toResponseDto', async () => {
      const id = 1;
      const updateDto: UpdateAppointmentDto = { jam_janji: '11:00' };
      const updatedEntity = {
        ...mockAppointmentEntity,
        appointment_time: '11:00',
      };
      const updatedDto = {
        ...mockAppointmentResponseDto,
        appointment_time: '11:00',
      };

      // Arrange
      mockUpdateService.execute.mockResolvedValue(updatedEntity);
      mockMapper.toResponseDto.mockReturnValue(updatedDto);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(mockUpdateService.execute).toHaveBeenCalledWith(id, updateDto);
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(updatedEntity);
      expect(result).toBe(updatedDto);
    });
  });

  describe('remove', () => {
    it('should call deletionService.execute and return void', async () => {
      const id = 1;

      // Arrange
      mockDeletionService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.remove(id, mockUser);

      // Assert
      expect(mockDeletionService.execute).toHaveBeenCalledWith(id, mockUser);
      expect(result).toBeUndefined();
      expect(mockMapper.toResponseDto).not.toHaveBeenCalled(); // Memastikan mapper tidak dipanggil
    });
  });
});