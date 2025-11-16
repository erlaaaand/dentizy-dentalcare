// ======================================
// IMPORTS
// ======================================
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentFindService } from '../appointment-find.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentValidator } from '../../../domains/validators/appointment.validator';
import { User } from '../../../../users/domains/entities/user.entity';
import { Appointment } from '../../../domains/entities/appointment.entity';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';
import { Gender, Patient } from '../../../../patients/domains/entities/patient.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

// ======================================
// MOCK DATA
// ======================================

// ✅ Mock Patient (BUKAN User, hanya untuk relasi di Appointment)
const mockPatient: Patient = {
  id: 1,
  nama_lengkap: 'John Doe',
  tanggal_lahir: new Date('1990-01-01'),
  jenis_kelamin: Gender.MALE,
  alamat: 'Jl. Test No. 123',
  no_hp: '081234567890',
  email: 'john@example.com',
  nik: '1234567890123456',
  created_at: new Date(),
  updated_at: new Date(),
} as Patient;

// ✅ Mock Doctor User (Staff internal - Dokter)
const mockDoctorUser: User = {
  id: 2,
  username: 'dr.smith',
  password: 'hashed_password',
  nama_lengkap: 'Dr. Smith',
  roles: [
    {
      id: 1,
      name: UserRole.DOKTER,
    },
  ],
} as User;

// ✅ Mock Admin/Staff User (Staff internal - Admin)
const mockAdminUser: User = {
  id: 3,
  username: 'admin.user',
  password: 'hashed_password',
  nama_lengkap: 'Admin User',
  roles: [
    {
      id: 3,
      name: UserRole.STAF,
    },
  ],
} as User;

// ✅ Mock Staf User lainnya
const mockStaffUser: User = {
  id: 4,
  username: 'staff.receptionist',
  password: 'hashed_password',
  nama_lengkap: 'Staff Receptionist',
  roles: [
    {
      id: 3,
      name: UserRole.STAF,
    },
  ],
} as User;

const mockAppointment: Appointment = {
  id: 1,
  patient_id: 1,
  doctor_id: 2,
  tanggal_janji: new Date('2024-12-25'),
  jam_janji: '10:00:00',
  status: AppointmentStatus.DIJADWALKAN,
  keluhan: 'Sakit gigi berlubang',
  patient: mockPatient, // ✅ Relasi ke Patient
  doctor: mockDoctorUser, // ✅ Relasi ke Doctor (User)
  created_at: new Date(),
  updated_at: new Date(),
} as Appointment;

// ======================================
// TEST SUITE
// ======================================
describe('AppointmentFindService', () => {
  let service: AppointmentFindService;
  let repository: AppointmentsRepository;
  let validator: AppointmentValidator;

  // ======================================
  // SETUP AND TEARDOWN
  // ======================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentFindService,
        {
          provide: AppointmentsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: AppointmentValidator,
          useValue: {
            validateAppointmentExists: jest.fn(),
            validateViewAuthorization: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentFindService>(AppointmentFindService);
    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    validator = module.get<AppointmentValidator>(AppointmentValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ======================================
  // EXECUTE METHOD TESTS
  // ======================================
  describe('execute', () => {
    // ✅ Test untuk Doctor (bisa view appointment mereka sendiri)
    it('should successfully find an appointment by ID for doctor', async () => {
      // Arrange
      const appointmentId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
      jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

      // Act
      const result = await service.execute(appointmentId, mockDoctorUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(mockAppointment, appointmentId);
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockDoctorUser);
      expect(result).toEqual(mockAppointment);
    });

    // ✅ Test untuk Admin/Staff (bisa view semua appointment)
    it('should successfully find an appointment by ID for admin', async () => {
      // Arrange
      const appointmentId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
      jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

      // Act
      const result = await service.execute(appointmentId, mockAdminUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(mockAppointment, appointmentId);
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockAdminUser);
      expect(result).toEqual(mockAppointment);
    });

    it('should successfully find an appointment by ID for staff', async () => {
      // Arrange
      const appointmentId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
      jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

      // Act
      const result = await service.execute(appointmentId, mockStaffUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(mockAppointment, appointmentId);
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockStaffUser);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw error when appointment not found', async () => {
      // Arrange
      const appointmentId = 999;

      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      jest.spyOn(validator, 'validateAppointmentExists').mockImplementation((appointment, id) => {
        if (!appointment) {
          throw new Error(`Appointment with ID ${id} not found`);
        }
      });

      // Act & Assert
      await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(
        `Appointment with ID ${appointmentId} not found`
      );

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(null, appointmentId);
      expect(validator.validateViewAuthorization).not.toHaveBeenCalled();
    });

    it('should throw error when view authorization fails for doctor', async () => {
      // Arrange
      const appointmentId = 1;
      const authorizationError = new Error('Doctor can only view their own appointments');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
      jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => {
        throw authorizationError;
      });

      // Act & Assert
      await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(authorizationError);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(mockAppointment, appointmentId);
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockDoctorUser);
    });

    // ======================================
    // AUTHORIZATION SCENARIOS TESTS
    // ======================================
    describe('Authorization scenarios', () => {
      it('should allow doctor to view their own appointment', async () => {
        // Arrange
        const appointmentId = 1;
        const doctorOwnAppointment = {
          ...mockAppointment,
          doctor_id: mockDoctorUser.id,
        };

        jest.spyOn(repository, 'findById').mockResolvedValue(doctorOwnAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

        // Act
        const result = await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(validator.validateViewAuthorization).toHaveBeenCalledWith(doctorOwnAppointment, mockDoctorUser);
        expect(result).toEqual(doctorOwnAppointment);
      });

      it('should prevent doctor from viewing other doctor appointments', async () => {
        // Arrange
        const appointmentId = 1;
        const otherDoctorAppointment = {
          ...mockAppointment,
          doctor_id: 999, // ❌ Different doctor
        };

        jest.spyOn(repository, 'findById').mockResolvedValue(otherDoctorAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => {
          throw new Error('Unauthorized: Doctor can only view their own appointments');
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(
          'Unauthorized: Doctor can only view their own appointments'
        );
      });

      it('should allow admin to view any appointment', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

        // Act
        const result = await service.execute(appointmentId, mockAdminUser);

        // Assert
        expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockAdminUser);
        expect(result).toEqual(mockAppointment);
      });

      it('should allow staff to view any appointment', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

        // Act
        const result = await service.execute(appointmentId, mockStaffUser);

        // Assert
        expect(validator.validateViewAuthorization).toHaveBeenCalledWith(mockAppointment, mockStaffUser);
        expect(result).toEqual(mockAppointment);
      });
    });

    // ======================================
    // LOGGING TESTS
    // ======================================
    describe('Logging', () => {
      it('should log debug message when appointment found successfully', async () => {
        // Arrange
        const appointmentId = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'debug');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => { });

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(loggerSpy).toHaveBeenCalledWith(`📋 Found appointment #${appointmentId}`);
      });

      it('should log error when finding appointment fails', async () => {
        // Arrange
        const appointmentId = 999;
        const notFoundError = new Error('Appointment not found');
        const loggerSpy = jest.spyOn(service['logger'], 'error');

        jest.spyOn(repository, 'findById').mockResolvedValue(null);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => {
          throw notFoundError;
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(notFoundError);
        expect(loggerSpy).toHaveBeenCalledWith(
          `❌ Error finding appointment ID ${appointmentId}:`,
          expect.any(String)
        );
      });
    });

    // ======================================
    // VALIDATION FLOW TESTS
    // ======================================
    describe('Validation flow', () => {
      it('should call validators in correct order', async () => {
        // Arrange
        const appointmentId = 1;
        const callOrder: string[] = [];

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => {
          callOrder.push('validateAppointmentExists');
        });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => {
          callOrder.push('validateViewAuthorization');
        });

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(callOrder).toEqual(['validateAppointmentExists', 'validateViewAuthorization']);
      });

      it('should stop execution when appointment not found', async () => {
        // Arrange
        const appointmentId = 999;

        jest.spyOn(repository, 'findById').mockResolvedValue(null);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation((appointment, id) => {
          if (!appointment) {
            throw new Error('Appointment not found');
          }
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow('Appointment not found');
        expect(validator.validateViewAuthorization).not.toHaveBeenCalled();
      });

      it('should stop execution when authorization fails', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => { });
        jest.spyOn(validator, 'validateViewAuthorization').mockImplementation(() => {
          throw new Error('Authorization failed');
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow('Authorization failed');
      });
    });

    // ======================================
    // ERROR HANDLING TESTS
    // ======================================
    describe('Error handling', () => {
      it('should handle database errors when finding appointment', async () => {
        // Arrange
        const appointmentId = 1;
        const databaseError = new Error('Database connection failed');

        jest.spyOn(repository, 'findById').mockRejectedValue(databaseError);

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(databaseError);
      });

      it('should re-throw validation errors', async () => {
        // Arrange
        const appointmentId = 1;
        const validationError = new Error('Custom validation error');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest.spyOn(validator, 'validateAppointmentExists').mockImplementation(() => {
          throw validationError;
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockDoctorUser)).rejects.toThrow(validationError);
      });
    });
  });
});