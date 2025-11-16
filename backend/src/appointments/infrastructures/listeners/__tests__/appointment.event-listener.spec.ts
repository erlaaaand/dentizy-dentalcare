import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AppointmentEventListener } from '../appointment.event-listener';
import { NotificationsService } from '../../../../notifications/applications/orchestrator/notifications.service';
import {
  AppointmentCreatedEvent,
  AppointmentCancelledEvent,
  AppointmentCompletedEvent,
  AppointmentUpdatedEvent,
  AppointmentDeletedEvent,
} from '../../events';
import { Appointment, AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('AppointmentEventListener', () => {
  let listener: AppointmentEventListener;
  let notificationsService: jest.Mocked<NotificationsService>;
  let mockAppointment: Appointment;

  beforeEach(async () => {
    const mockNotificationsService = {
      scheduleAppointmentReminder: jest.fn(),
      cancelRemindersFor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentEventListener,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    listener = module.get<AppointmentEventListener>(AppointmentEventListener);
    notificationsService = module.get(NotificationsService);

    mockAppointment = {
      id: 1,
      patient_id: 10,
      doctor_id: 5,
      tanggal_janji: new Date('2025-11-20'),
      jam_janji: '10:00',
      keluhan: 'Demam',
      status: AppointmentStatus.DIJADWALKAN,
      patient: {
        id: 10,
        email: 'patient@test.com',
        is_registered_online: true,
      },
    } as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAppointmentCreated', () => {
    it('should log appointment creation', async () => {
      const event = new AppointmentCreatedEvent(mockAppointment, false);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentCreated(event);

      expect(logSpy).toHaveBeenCalledWith('📅 Appointment created: #1');
    });

    it('should schedule reminder when shouldScheduleReminder is true', async () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);

      await listener.handleAppointmentCreated(event);

      expect(notificationsService.scheduleAppointmentReminder).toHaveBeenCalledWith(
        mockAppointment
      );
    });

    it('should not schedule reminder when shouldScheduleReminder is false', async () => {
      const event = new AppointmentCreatedEvent(mockAppointment, false);

      await listener.handleAppointmentCreated(event);

      expect(notificationsService.scheduleAppointmentReminder).not.toHaveBeenCalled();
    });

    it('should log success when reminder is scheduled', async () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentCreated(event);

      expect(logSpy).toHaveBeenCalledWith('📧 Reminder scheduled for appointment #1');
    });

    it('should handle error when scheduling reminder fails', async () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);
      const error = new Error('Scheduling failed');
      notificationsService.scheduleAppointmentReminder.mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await listener.handleAppointmentCreated(event);

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to schedule reminder: Scheduling failed',
        error.stack
      );
    });
  });

  describe('handleAppointmentCancelled', () => {
    it('should log appointment cancellation', async () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5, 'Test reason');
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentCancelled(event);

      expect(logSpy).toHaveBeenCalledWith(
        '❌ Appointment cancelled: #1 by user #5'
      );
    });

    it('should cancel reminders', async () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);

      await listener.handleAppointmentCancelled(event);

      expect(notificationsService.cancelRemindersFor).toHaveBeenCalledWith(1);
    });

    it('should log success when reminders are cancelled', async () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentCancelled(event);

      expect(logSpy).toHaveBeenCalledWith('📧 Reminders cancelled for appointment #1');
    });

    it('should handle error when cancelling reminders fails', async () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);
      const error = new Error('Cancellation failed');
      notificationsService.cancelRemindersFor.mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await listener.handleAppointmentCancelled(event);

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to cancel reminders: Cancellation failed',
        error.stack
      );
    });
  });

  describe('handleAppointmentCompleted', () => {
    it('should log appointment completion', async () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentCompleted(event);

      expect(logSpy).toHaveBeenCalledWith(
        '✅ Appointment completed: #1 by user #5'
      );
    });

    it('should not call any notification service', async () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      await listener.handleAppointmentCompleted(event);

      expect(notificationsService.scheduleAppointmentReminder).not.toHaveBeenCalled();
      expect(notificationsService.cancelRemindersFor).not.toHaveBeenCalled();
    });
  });

  describe('handleAppointmentUpdated', () => {
    it('should log appointment update', async () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, false);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentUpdated(event);

      expect(logSpy).toHaveBeenCalledWith('🔄 Appointment updated: #1');
    });

    it('should not reschedule when time is not updated', async () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, false);

      await listener.handleAppointmentUpdated(event);

      expect(notificationsService.cancelRemindersFor).not.toHaveBeenCalled();
      expect(notificationsService.scheduleAppointmentReminder).not.toHaveBeenCalled();
    });

    it('should reschedule reminder when time is updated and patient is registered', async () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true);

      await listener.handleAppointmentUpdated(event);

      expect(notificationsService.cancelRemindersFor).toHaveBeenCalledWith(1);
      expect(notificationsService.scheduleAppointmentReminder).toHaveBeenCalledWith(
        mockAppointment
      );
    });

    it('should not schedule new reminder when patient has no email', async () => {
      const appointmentNoEmail = { ...mockAppointment, patient: { ...mockAppointment.patient, email: null } };
      const event = new AppointmentUpdatedEvent(appointmentNoEmail as any, true);

      await listener.handleAppointmentUpdated(event);

      expect(notificationsService.cancelRemindersFor).toHaveBeenCalledWith(1);
      expect(notificationsService.scheduleAppointmentReminder).not.toHaveBeenCalled();
    });

    it('should not schedule new reminder when patient is not registered online', async () => {
      const appointmentOffline = { 
        ...mockAppointment, 
        patient: { ...mockAppointment.patient, is_registered_online: false } 
      };
      const event = new AppointmentUpdatedEvent(appointmentOffline as any, true);

      await listener.handleAppointmentUpdated(event);

      expect(notificationsService.cancelRemindersFor).toHaveBeenCalledWith(1);
      expect(notificationsService.scheduleAppointmentReminder).not.toHaveBeenCalled();
    });

    it('should log success when reminder is rescheduled', async () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentUpdated(event);

      expect(logSpy).toHaveBeenCalledWith('📧 Reminder rescheduled for appointment #1');
    });

    it('should handle error when rescheduling fails', async () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true);
      const error = new Error('Rescheduling failed');
      notificationsService.scheduleAppointmentReminder.mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await listener.handleAppointmentUpdated(event);

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to reschedule reminder: Rescheduling failed',
        error.stack
      );
    });
  });

  describe('handleAppointmentDeleted', () => {
    it('should log appointment deletion', async () => {
      const event = new AppointmentDeletedEvent(1, 5);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentDeleted(event);

      expect(logSpy).toHaveBeenCalledWith(
        '🗑️ Appointment deleted: #1 by user #5'
      );
    });

    it('should cancel reminders for deleted appointment', async () => {
      const event = new AppointmentDeletedEvent(1, 5);

      await listener.handleAppointmentDeleted(event);

      expect(notificationsService.cancelRemindersFor).toHaveBeenCalledWith(1);
    });

    it('should log success when reminders are cancelled', async () => {
      const event = new AppointmentDeletedEvent(1, 5);
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleAppointmentDeleted(event);

      expect(logSpy).toHaveBeenCalledWith(
        '📧 Reminders cancelled for deleted appointment #1'
      );
    });

    it('should handle error when cancelling reminders fails', async () => {
      const event = new AppointmentDeletedEvent(1, 5);
      const error = new Error('Cancellation failed');
      notificationsService.cancelRemindersFor.mockRejectedValue(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await listener.handleAppointmentDeleted(event);

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to cancel reminders: Cancellation failed',
        error.stack
      );
    });
  });
});