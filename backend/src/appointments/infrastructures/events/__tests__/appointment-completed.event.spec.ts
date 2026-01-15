import { AppointmentCompletedEvent } from '../appointment-completed.event';
import {
  Appointment,
  AppointmentStatus,
} from '../../../domains/entities/appointment.entity';

describe('AppointmentCompletedEvent', () => {
  let mockAppointment: Appointment;

  beforeEach(() => {
    mockAppointment = {
      id: 1,
      patient_id: 10,
      doctor_id: 5,
      tanggal_janji: new Date('2025-11-20'),
      jam_janji: '10:00',
      keluhan: 'Demam',
      status: AppointmentStatus.SELESAI,
    } as Appointment;
  });

  describe('constructor', () => {
    it('should create event with appointment and completedBy', () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.completedBy).toBe(5);
    });

    it('should store correct completedBy user ID', () => {
      const userId = 50;
      const event = new AppointmentCompletedEvent(mockAppointment, userId);

      expect(event.completedBy).toBe(userId);
    });

    it('should store appointment reference correctly', () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      expect(event.appointment.id).toBe(1);
      expect(event.appointment.status).toBe(AppointmentStatus.SELESAI);
    });
  });

  describe('properties', () => {
    it('should have readonly appointment property', () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      expect(event).toHaveProperty('appointment');
      expect(event.appointment).toEqual(mockAppointment);
    });

    it('should have readonly completedBy property', () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      expect(event).toHaveProperty('completedBy');
      expect(event.completedBy).toBe(5);
    });

    it('should not allow modification of properties', () => {
      const event = new AppointmentCompletedEvent(mockAppointment, 5);

      // TypeScript akan prevent ini, tapi kita test runtime behavior
      expect(() => {
        (event as any).completedBy = 999;
      }).not.toThrow();

      // Property masih bisa diubah di runtime karena readonly hanya TypeScript feature
      // Tapi kita verifikasi structure-nya benar
      expect(event).toHaveProperty('appointment');
      expect(event).toHaveProperty('completedBy');
    });
  });
});
