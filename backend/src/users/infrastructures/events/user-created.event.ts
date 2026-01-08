// infrastructure/events/user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly nama_lengkap: string,
    public readonly roles: string[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
