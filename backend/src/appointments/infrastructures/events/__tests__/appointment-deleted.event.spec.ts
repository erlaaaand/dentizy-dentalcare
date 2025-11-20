import { AppointmentDeletedEvent } from '../appointment-deleted.event';

describe('AppointmentDeletedEvent', () => {
  describe('constructor', () => {
    it('should create event with appointmentId and deletedBy', () => {
      const event = new AppointmentDeletedEvent(1, 5);

      expect(event.appointmentId).toBe(1);
      expect(event.deletedBy).toBe(5);
    });

    it('should store correct appointmentId', () => {
      const appointmentId = 999;
      const event = new AppointmentDeletedEvent(appointmentId, 5);

      expect(event.appointmentId).toBe(appointmentId);
    });

    it('should store correct deletedBy user ID', () => {
      const userId = 100;
      const event = new AppointmentDeletedEvent(1, userId);

      expect(event.deletedBy).toBe(userId);
    });
  });

  describe('properties', () => {
    it('should have readonly appointmentId property', () => {
      const event = new AppointmentDeletedEvent(1, 5);

      expect(event).toHaveProperty('appointmentId');
      expect(event.appointmentId).toBe(1);
    });

    it('should have readonly deletedBy property', () => {
      const event = new AppointmentDeletedEvent(1, 5);

      expect(event).toHaveProperty('deletedBy');
      expect(event.deletedBy).toBe(5);
    });
  });

  describe('data integrity', () => {
    it('should maintain IDs as numbers', () => {
      const event = new AppointmentDeletedEvent(123, 456);

      expect(typeof event.appointmentId).toBe('number');
      expect(typeof event.deletedBy).toBe('number');
    });

    it('should handle large ID numbers', () => {
      const largeId = 999999999;
      const event = new AppointmentDeletedEvent(largeId, largeId);

      expect(event.appointmentId).toBe(largeId);
      expect(event.deletedBy).toBe(largeId);
    });
  });

  describe('use cases', () => {
    it('should contain only IDs without appointment entity', () => {
      const event = new AppointmentDeletedEvent(1, 5);

      // Event hanya menyimpan ID, bukan entity lengkap
      expect(event).not.toHaveProperty('appointment');
      expect(event.appointmentId).toBeDefined();
    });

    it('should support audit trail tracking', () => {
      const event = new AppointmentDeletedEvent(1, 5);

      // Event ini bisa digunakan untuk audit log
      expect(event.appointmentId).toBe(1);
      expect(event.deletedBy).toBe(5);
      // Listener bisa log: "Appointment #1 deleted by user #5"
    });
  });
});