import * as EventsIndex from '../index';
import { AppointmentCreatedEvent } from '../appointment-created.event';
import { AppointmentUpdatedEvent } from '../appointment-updated.event';
import { AppointmentCancelledEvent } from '../appointment-cancelled.event';
import { AppointmentCompletedEvent } from '../appointment-completed.event';
import { AppointmentDeletedEvent } from '../appointment-deleted.event';

describe('Events Index', () => {
  describe('exports', () => {
    it('should export AppointmentCreatedEvent', () => {
      expect(EventsIndex.AppointmentCreatedEvent).toBe(AppointmentCreatedEvent);
    });

    it('should export AppointmentUpdatedEvent', () => {
      expect(EventsIndex.AppointmentUpdatedEvent).toBe(AppointmentUpdatedEvent);
    });

    it('should export AppointmentCancelledEvent', () => {
      expect(EventsIndex.AppointmentCancelledEvent).toBe(
        AppointmentCancelledEvent,
      );
    });

    it('should export AppointmentCompletedEvent', () => {
      expect(EventsIndex.AppointmentCompletedEvent).toBe(
        AppointmentCompletedEvent,
      );
    });

    it('should export AppointmentDeletedEvent', () => {
      expect(EventsIndex.AppointmentDeletedEvent).toBe(AppointmentDeletedEvent);
    });
  });

  describe('all exports', () => {
    it('should export exactly 5 event classes', () => {
      const exports = Object.keys(EventsIndex);
      expect(exports).toHaveLength(5);
    });

    it('should export all expected events', () => {
      const exports = Object.keys(EventsIndex);

      expect(exports).toContain('AppointmentCreatedEvent');
      expect(exports).toContain('AppointmentUpdatedEvent');
      expect(exports).toContain('AppointmentCancelledEvent');
      expect(exports).toContain('AppointmentCompletedEvent');
      expect(exports).toContain('AppointmentDeletedEvent');
    });
  });

  describe('event classes accessibility', () => {
    it('should allow instantiation of AppointmentCreatedEvent', () => {
      const appointment = { id: 1 } as any;
      const event = new EventsIndex.AppointmentCreatedEvent(appointment, true);

      expect(event).toBeInstanceOf(AppointmentCreatedEvent);
    });

    it('should allow instantiation of AppointmentCancelledEvent', () => {
      const appointment = { id: 1 } as any;
      const event = new EventsIndex.AppointmentCancelledEvent(appointment, 5);

      expect(event).toBeInstanceOf(AppointmentCancelledEvent);
    });

    it('should allow instantiation of AppointmentCompletedEvent', () => {
      const appointment = { id: 1 } as any;
      const event = new EventsIndex.AppointmentCompletedEvent(appointment, 5);

      expect(event).toBeInstanceOf(AppointmentCompletedEvent);
    });

    it('should allow instantiation of AppointmentUpdatedEvent', () => {
      const appointment = { id: 1 } as any;
      const event = new EventsIndex.AppointmentUpdatedEvent(appointment, true);

      expect(event).toBeInstanceOf(AppointmentUpdatedEvent);
    });

    it('should allow instantiation of AppointmentDeletedEvent', () => {
      const event = new EventsIndex.AppointmentDeletedEvent(1, 5);

      expect(event).toBeInstanceOf(AppointmentDeletedEvent);
    });
  });
});
