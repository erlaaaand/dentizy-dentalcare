// ======================================
// IMPORTS
// ======================================
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentDeletionService } from '../appointment-deletion.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentValidator } from '../../../domains/validators/appointment.validator';
import { AppointmentDeletedEvent } from '../../../infrastructures/events';
import { User } from '../../../../users/domains/entities/user.entity';
import { Appointment } from '../../../domains/entities/appointment.entity';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

// ======================================
// MOCK DATA
// ======================================
const mockUser: User = {
  id: 1,
  nama_lengkap: 'Dr. Smith',
  roles: [{ id: 1, name: UserRole.DOKTER, description: '' }],
} as User;

const mockAppointment: Appointment = {
  id: 1,
  patient_id: 1,
  doctor_id: 2,
  tanggal_janji: new Date('2024-12-25'),
  jam_janji: '10:00:00',
  status: AppointmentStatus.DIJADWALKAN,
  keluhan: 'Sakit gigi',
  created_at: new Date(),
  updated_at: new Date(),
} as Appointment;

// ======================================
// TEST SUITE
// ======================================
describe('AppointmentDeletionService', () => {
  let service: AppointmentDeletionService;
  let repository: AppointmentsRepository;
  let validator: AppointmentValidator;
  let eventEmitter: EventEmitter2;

  // ======================================
  // SETUP AND TEARDOWN
  // ======================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentDeletionService,
        {
          provide: AppointmentsRepository,
          useValue: {
            findById: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AppointmentValidator,
          useValue: {
            validateAppointmentExists: jest.fn(),
            validateForDeletion: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentDeletionService>(
      AppointmentDeletionService,
    );
    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    validator = module.get<AppointmentValidator>(AppointmentValidator);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ======================================
  // EXECUTE METHOD TESTS
  // ======================================
  describe('execute', () => {
    it('should successfully delete an appointment', async () => {
      // Arrange
      const appointmentId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {});
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);
      jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

      // Act
      await service.execute(appointmentId, mockUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateForDeletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.remove).toHaveBeenCalledWith(mockAppointment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.deleted',
        expect.any(AppointmentDeletedEvent),
      );
    });

    it('should throw error when appointment not found', async () => {
      // Arrange
      const appointmentId = 999;

      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation((appointment, id) => {
          if (!appointment) {
            throw new Error(`Appointment with ID ${id} not found`);
          }
        });

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        `Appointment with ID ${appointmentId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateForDeletion).not.toHaveBeenCalled();
      expect(repository.remove).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw error when deletion validation fails', async () => {
      // Arrange
      const appointmentId = 1;
      const deletionError = new Error(
        'Cannot delete appointment with medical record',
      );

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {
        throw deletionError;
      });

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        deletionError,
      );

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateForDeletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.remove).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle database error when deleting appointment', async () => {
      // Arrange
      const appointmentId = 1;
      const databaseError = new Error('Database deletion failed');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {});
      jest.spyOn(repository, 'remove').mockRejectedValue(databaseError);

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        databaseError,
      );

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateForDeletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.remove).toHaveBeenCalledWith(mockAppointment);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit event when deletion fails', async () => {
      // Arrange
      const appointmentId = 1;
      const validationError = new Error('Validation failed');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
        validationError,
      );
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    // ======================================
    // EVENT EMISSION TESTS
    // ======================================
    describe('Event emission', () => {
      it('should emit AppointmentDeletedEvent with correct parameters', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateForDeletion')
          .mockImplementation(() => {});
        jest.spyOn(repository, 'remove').mockResolvedValue(undefined);
        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        // Act
        await service.execute(appointmentId, mockUser);

        // Assert
        expect(emitSpy).toHaveBeenCalledWith(
          'appointment.deleted',
          expect.objectContaining({
            appointmentId: appointmentId,
            deletedBy: mockUser.id,
          }),
        );
      });

      it('should emit event only after successful deletion', async () => {
        // Arrange
        const appointmentId = 1;
        let deletionCompleted = false;
        let eventEmitted = false;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateForDeletion')
          .mockImplementation(() => {});
        jest.spyOn(repository, 'remove').mockImplementation(async () => {
          deletionCompleted = true;
        });
        jest.spyOn(eventEmitter, 'emit').mockImplementation(() => {
          // Verify that deletion completed before event emission
          expect(deletionCompleted).toBe(true);
          eventEmitted = true;
          return true;
        });

        // Act
        await service.execute(appointmentId, mockUser);

        // Assert
        expect(deletionCompleted).toBe(true);
        expect(eventEmitted).toBe(true);
      });
    });

    // ======================================
    // LOGGING TESTS
    // ======================================
    describe('Logging', () => {
      it('should log successful deletion', async () => {
        // Arrange
        const appointmentId = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'log');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateForDeletion')
          .mockImplementation(() => {});
        jest.spyOn(repository, 'remove').mockResolvedValue(undefined);
        jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

        // Act
        await service.execute(appointmentId, mockUser);

        // Assert
        expect(loggerSpy).toHaveBeenCalledWith(
          `🗑️ Appointment #${appointmentId} deleted`,
        );
      });

      it('should log error when deletion fails', async () => {
        // Arrange
        const appointmentId = 1;
        const validationError = new Error('Validation failed');
        const loggerSpy = jest.spyOn(service['logger'], 'error');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {
          throw validationError;
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
          validationError,
        );
        expect(loggerSpy).toHaveBeenCalledWith(
          `❌ Error deleting appointment ID ${appointmentId}:`,
          expect.any(String),
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
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {
            callOrder.push('validateAppointmentExists');
          });
        jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {
          callOrder.push('validateForDeletion');
        });
        jest.spyOn(repository, 'remove').mockResolvedValue(undefined);
        jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

        // Act
        await service.execute(appointmentId, mockUser);

        // Assert
        expect(callOrder).toEqual([
          'validateAppointmentExists',
          'validateForDeletion',
        ]);
      });

      it('should stop execution when appointment not found', async () => {
        // Arrange
        const appointmentId = 999;

        jest.spyOn(repository, 'findById').mockResolvedValue(null);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation((appointment, id) => {
            if (!appointment) {
              throw new Error('Appointment not found');
            }
          });

        // Act & Assert
        await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
          'Appointment not found',
        );
        expect(validator.validateForDeletion).not.toHaveBeenCalled();
        expect(repository.remove).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });

      it('should stop execution when deletion validation fails', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest.spyOn(validator, 'validateForDeletion').mockImplementation(() => {
          throw new Error('Deletion validation failed');
        });

        // Act & Assert
        await expect(service.execute(appointmentId, mockUser)).rejects.toThrow(
          'Deletion validation failed',
        );
        expect(repository.remove).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });
  });
});
