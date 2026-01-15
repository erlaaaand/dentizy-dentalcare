/**
 * Event: Appointment Deleted
 * Triggered ketika appointment dihapus
 */
export class AppointmentDeletedEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly deletedBy: string,
  ) {}
}
