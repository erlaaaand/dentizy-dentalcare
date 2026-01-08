import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentCompletionService } from '../appointment-completion.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentValidator } from '../../../domains/validators/appointment.validator';
import { AppointmentDomainService } from '../../../domains/services/appointment-domain.service';
import { AppointmentCompletedEvent } from '../../../infrastructures/events/';
import { Appointment } from '../../../domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('AppointmentCompletionService', () => {
  let service: AppointmentCompletionService;
  let repository: AppointmentsRepository;
  let validator: AppointmentValidator;
  let domainService: AppointmentDomainService;
  let eventEmitter: EventEmitter2;

  const mockDoctorUser: User = {
    id: 2,
    nama_lengkap: 'Dr. Smith',
    roles: [{ id: 1, name: UserRole.DOKTER, description: '' }],
  } as User;

  const mockAppointment: Appointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    tanggal_janji: new Date('2024-12-12'),
    jam_janji: '10:00:00',
    status: AppointmentStatus.DIJADWALKAN,
    keluhan: 'Sakit gigi',
    created_at: new Date(),
    updated_at: new Date(),
  } as Appointment;

  const mockCompletedAppointment: Appointment = {
    ...mockAppointment,
    status: AppointmentStatus.SELESAI,
    updated_at: new Date(),
  } as Appointment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCompletionService,
        {
          provide: AppointmentsRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AppointmentValidator,
          useValue: {
            validateAppointmentExists: jest.fn(),
            validateViewAuthorization: jest.fn(),
            validateStatusForCompletion: jest.fn(),
            validateCompletionAuthorization: jest.fn(),
          },
        },
        {
          provide: AppointmentDomainService,
          useValue: {
            completeAppointment: jest.fn(),
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

    service = module.get<AppointmentCompletionService>(
      AppointmentCompletionService,
    );
    repository = module.get<AppointmentsRepository>(AppointmentsRepository);
    validator = module.get<AppointmentValidator>(AppointmentValidator);
    domainService = module.get<AppointmentDomainService>(
      AppointmentDomainService,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully complete an appointment', async () => {
      // Arrange
      const appointmentId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateStatusForCompletion')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateCompletionAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(domainService, 'completeAppointment')
        .mockReturnValue(mockCompletedAppointment);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockCompletedAppointment);
      jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

      // Act
      const result = await service.execute(appointmentId, mockDoctorUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(validator.validateStatusForCompletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(validator.validateCompletionAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(domainService.completeAppointment).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.save).toHaveBeenCalledWith(mockCompletedAppointment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.completed',
        expect.any(AppointmentCompletedEvent),
      );
      expect(result).toEqual(mockCompletedAppointment);
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
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(`Appointment with ID ${appointmentId} not found`);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateViewAuthorization).not.toHaveBeenCalled();
      expect(domainService.completeAppointment).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw error when view authorization fails', async () => {
      // Arrange
      const appointmentId = 1;
      const authorizationError = new Error(
        'Unauthorized to view this appointment',
      );

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {
          throw authorizationError;
        });

      // Act & Assert
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(authorizationError);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(validator.validateStatusForCompletion).not.toHaveBeenCalled();
      expect(domainService.completeAppointment).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw error when status validation fails', async () => {
      // Arrange
      const appointmentId = 1;
      const statusError = new Error(
        'Appointment must be in DIJADWALKAN status to complete',
      );

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateStatusForCompletion')
        .mockImplementation(() => {
          throw statusError;
        });

      // Act & Assert
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(statusError);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(validator.validateStatusForCompletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(validator.validateCompletionAuthorization).not.toHaveBeenCalled();
      expect(domainService.completeAppointment).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw error when completion authorization fails', async () => {
      // Arrange
      const appointmentId = 1;
      const completionAuthError = new Error(
        'Only assigned doctor can complete this appointment',
      );

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateStatusForCompletion')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateCompletionAuthorization')
        .mockImplementation(() => {
          throw completionAuthError;
        });

      // Act & Assert
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(completionAuthError);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(validator.validateAppointmentExists).toHaveBeenCalledWith(
        mockAppointment,
        appointmentId,
      );
      expect(validator.validateViewAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(validator.validateStatusForCompletion).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(validator.validateCompletionAuthorization).toHaveBeenCalledWith(
        mockAppointment,
        mockDoctorUser,
      );
      expect(domainService.completeAppointment).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle database error when saving appointment', async () => {
      // Arrange
      const appointmentId = 1;
      const databaseError = new Error('Database connection failed');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateStatusForCompletion')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateCompletionAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(domainService, 'completeAppointment')
        .mockReturnValue(mockCompletedAppointment);
      jest.spyOn(repository, 'save').mockRejectedValue(databaseError);

      // Act & Assert
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(databaseError);

      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(domainService.completeAppointment).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(repository.save).toHaveBeenCalledWith(mockCompletedAppointment);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit event when save operation fails', async () => {
      // Arrange
      const appointmentId = 1;
      const databaseError = new Error('Save failed');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest
        .spyOn(validator, 'validateAppointmentExists')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateViewAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateStatusForCompletion')
        .mockImplementation(() => {});
      jest
        .spyOn(validator, 'validateCompletionAuthorization')
        .mockImplementation(() => {});
      jest
        .spyOn(domainService, 'completeAppointment')
        .mockReturnValue(mockCompletedAppointment);
      jest.spyOn(repository, 'save').mockRejectedValue(databaseError);

      // Act & Assert
      await expect(
        service.execute(appointmentId, mockDoctorUser),
      ).rejects.toThrow(databaseError);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    describe('Logging', () => {
      it('should log successful completion', async () => {
        // Arrange
        const appointmentId = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'log');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(domainService, 'completeAppointment')
          .mockReturnValue(mockCompletedAppointment);
        jest
          .spyOn(repository, 'save')
          .mockResolvedValue(mockCompletedAppointment);
        jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(loggerSpy).toHaveBeenCalledWith(
          `✅ Appointment #${appointmentId} completed by user #${mockDoctorUser.id}`,
        );
      });

      it('should log error when completion fails', async () => {
        // Arrange
        const appointmentId = 1;
        const validationError = new Error('Validation failed');
        const loggerSpy = jest.spyOn(service['logger'], 'error');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {
            throw validationError;
          });

        // Act & Assert
        await expect(
          service.execute(appointmentId, mockDoctorUser),
        ).rejects.toThrow(validationError);
        expect(loggerSpy).toHaveBeenCalledWith(
          `❌ Error completing appointment ID ${appointmentId}:`,
          expect.any(String),
        );
      });
    });

    describe('Event emission', () => {
      it('should emit AppointmentCompletedEvent with correct parameters', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(domainService, 'completeAppointment')
          .mockReturnValue(mockCompletedAppointment);
        jest
          .spyOn(repository, 'save')
          .mockResolvedValue(mockCompletedAppointment);
        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(emitSpy).toHaveBeenCalledWith(
          'appointment.completed',
          expect.objectContaining({
            appointment: mockCompletedAppointment,
            completedBy: mockDoctorUser.id,
          }),
        );
      });

      it('should emit event only after successful save', async () => {
        // Arrange
        const appointmentId = 1;
        let saveCompleted = false;
        let eventEmitted = false;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(domainService, 'completeAppointment')
          .mockReturnValue(mockCompletedAppointment);
        jest.spyOn(repository, 'save').mockImplementation(async () => {
          saveCompleted = true;
          return mockCompletedAppointment;
        });
        jest.spyOn(eventEmitter, 'emit').mockImplementation(() => {
          // Verify that save completed before event emission
          expect(saveCompleted).toBe(true);
          eventEmitted = true;
          return true;
        });

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(saveCompleted).toBe(true);
        expect(eventEmitted).toBe(true);
      });
    });

    describe('Authorization scenarios', () => {
      it('should allow doctor to complete their own appointment', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(domainService, 'completeAppointment')
          .mockReturnValue(mockCompletedAppointment);
        jest
          .spyOn(repository, 'save')
          .mockResolvedValue(mockCompletedAppointment);
        jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

        // Act & Assert
        await expect(
          service.execute(appointmentId, mockDoctorUser),
        ).resolves.toEqual(mockCompletedAppointment);

        // Verify completion authorization was called with doctor user
        expect(validator.validateCompletionAuthorization).toHaveBeenCalledWith(
          mockAppointment,
          mockDoctorUser,
        );
      });

      it('should prevent patient from completing appointment', async () => {
        // Arrange
        const appointmentId = 1;
        const authError = new Error('Only doctor can complete appointment');

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {
            throw authError;
          });

        // Act & Assert
        await expect(
          service.execute(appointmentId, mockDoctorUser),
        ).rejects.toThrow(authError);
      });
    });

    describe('Status validation', () => {
      it('should validate that appointment is in DIJADWALKAN status', async () => {
        // Arrange
        const appointmentId = 1;

        jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
        jest
          .spyOn(validator, 'validateAppointmentExists')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateViewAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateStatusForCompletion')
          .mockImplementation(() => {});
        jest
          .spyOn(validator, 'validateCompletionAuthorization')
          .mockImplementation(() => {});
        jest
          .spyOn(domainService, 'completeAppointment')
          .mockReturnValue(mockCompletedAppointment);
        jest
          .spyOn(repository, 'save')
          .mockResolvedValue(mockCompletedAppointment);
        jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);

        // Act
        await service.execute(appointmentId, mockDoctorUser);

        // Assert
        expect(validator.validateStatusForCompletion).toHaveBeenCalledWith(
          mockAppointment,
        );
      });
    });
  });
});
