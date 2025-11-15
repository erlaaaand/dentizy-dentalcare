// infrastructure/events/password-changed.event.ts
export class PasswordChangedEvent {
    constructor(
        public readonly userId: number,
        public readonly username: string,
        public readonly changedBy: 'self' | 'admin',
        public readonly timestamp: Date = new Date()
    ) { }
}