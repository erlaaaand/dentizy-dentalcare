import { AppointmentCancelledEvent } from '../appointment-cancelled.event';
import { Appointment, AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('AppointmentCancelledEvent', () => {
  let mockAppointment: Appointment;

  beforeEach(() => {
    mockAppointment = {
      id: 1,
      patient_id: 10,
      doctor_id: 5,
      tanggal_janji: new Date('2025-11-20'),
      jam_janji: '10:00',
      keluhan: 'Demam',
      status: AppointmentStatus.DIBATALKAN,
    } as Appointment;
  });

  describe('constructor', () => {
    it('should create event with appointment, cancelledBy, and reason', () => {
      const event = new AppointmentCancelledEvent(
        mockAppointment,
        5,
        'Pasien berhalangan hadir'
      );

      expect(event.appointment).toBe(mockAppointment);
      expect(event.cancelledBy).toBe(5);
      expect(event.reason).toBe('Pasien berhalangan hadir');
    });

    it('should create event without reason', () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.cancelledBy).toBe(5);
      expect(event.reason).toBeUndefined();
    });

    it('should store correct cancelledBy user ID', () => {
      const userId = 100;
      const event = new AppointmentCancelledEvent(mockAppointment, userId);

      expect(event.cancelledBy).toBe(userId);
    });
  });

  describe('properties', () => {
    it('should have readonly appointment property', () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);

      expect(event).toHaveProperty('appointment');
      expect(event.appointment).toEqual(mockAppointment);
    });

    it('should have readonly cancelledBy property', () => {
      const event = new AppointmentCancelledEvent(mockAppointment, 5);

      expect(event).toHaveProperty('cancelledBy');
      expect(event.cancelledBy).toBe(5);
    });

    it('should have optional reason property', () => {
      const eventWithReason = new AppointmentCancelledEvent(
        mockAppointment,
        5,
        'Test reason'
      );
      const eventWithoutReason = new AppointmentCancelledEvent(mockAppointment, 5);

      expect(eventWithReason.reason).toBe('Test reason');
      expect(eventWithoutReason.reason).toBeUndefined();
    });
  });
});