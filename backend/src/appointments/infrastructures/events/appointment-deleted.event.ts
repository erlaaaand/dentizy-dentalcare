/**
 * Event: Appointment Deleted
 * Triggered ketika appointment dihapus
 */
export class AppointmentDeletedEvent {
  constructor(
    public readonly appointmentId: number,
    public readonly deletedBy: number,
  ) {}
}
