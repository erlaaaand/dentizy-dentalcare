// infrastructure/events/user-updated.event.ts
export class UserUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly changes: Record<string, any>,
    public readonly timestamp: Date = new Date(),
  ) {}
}
