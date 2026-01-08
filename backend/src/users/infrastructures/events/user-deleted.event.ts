// infrastructure/events/user-deleted.event.ts
export class UserDeletedEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
