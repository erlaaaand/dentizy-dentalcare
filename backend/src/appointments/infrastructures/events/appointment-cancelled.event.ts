import { Appointment } from '../../domains/entities/appointment.entity';

/**
 * Event: Appointment Cancelled
 * Triggered ketika appointment dibatalkan
 */
export class AppointmentCancelledEvent {
    constructor(
        public readonly appointment: Appointment,
        public readonly cancelledBy: number, // user ID
        public readonly reason?: string,
    ) { }
}