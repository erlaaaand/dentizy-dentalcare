import { TokenRefreshedEvent } from '../token-refreshed.event';

describe('TokenRefreshedEvent', () => {
  it('should be defined', () => {
    expect(TokenRefreshedEvent).toBeDefined();
  });

  describe('Constructor', () => {
    it('should create event with all parameters', () => {
      const customDate = new Date('2023-01-01');
      const event = new TokenRefreshedEvent(1, 'testuser', customDate);

      expect(event.userId).toBe(1);
      expect(event.username).toBe('testuser');
      expect(event.timestamp).toBe(customDate);
    });

    it('should create event with default timestamp', () => {
      const before = Date.now();
      const event = new TokenRefreshedEvent(1, 'testuser');
      const after = Date.now();

      expect(event.userId).toBe(1);
      expect(event.username).toBe('testuser');
      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(before);
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(after);
    });

    it('should create event with custom timestamp', () => {
      const specificDate = new Date('2024-01-15T10:30:00Z');
      const event = new TokenRefreshedEvent(1, 'user', specificDate);

      expect(event.timestamp).toBe(specificDate);
    });
  });

  describe('Properties', () => {
    it('should have readonly userId', () => {
      const event = new TokenRefreshedEvent(1, 'testuser');

      expect(event.userId).toBe(1);
      expect(() => {
        (event as any).userId = 2;
      }).toThrow();
    });

    it('should have readonly username', () => {
      const event = new TokenRefreshedEvent(1, 'testuser');

      expect(event.username).toBe('testuser');
      expect(() => {
        (event as any).username = 'other';
      }).toThrow();
    });

    it('should have readonly timestamp', () => {
      const event = new TokenRefreshedEvent(1, 'testuser');

      expect(event.timestamp).toBeInstanceOf(Date);
      expect(() => {
        (event as any).timestamp = new Date();
      }).toThrow();
    });

    it('should store correct userId', () => {
      const event = new TokenRefreshedEvent(456, 'user');

      expect(event.userId).toBe(456);
    });

    it('should store correct username', () => {
      const event = new TokenRefreshedEvent(1, 'myuser');

      expect(event.username).toBe('myuser');
    });
  });

  describe('Edge Cases', () => {
    it('should handle userId of 0', () => {
      const event = new TokenRefreshedEvent(0, 'user');

      expect(event.userId).toBe(0);
    });

    it('should handle negative userId', () => {
      const event = new TokenRefreshedEvent(-1, 'user');

      expect(event.userId).toBe(-1);
    });

    it('should handle empty username', () => {
      const event = new TokenRefreshedEvent(1, '');

      expect(event.username).toBe('');
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(1000);
      const event = new TokenRefreshedEvent(1, longUsername);

      expect(event.username).toBe(longUsername);
    });

    it('should handle special characters in username', () => {
      const event = new TokenRefreshedEvent(1, 'user@#$%');

      expect(event.username).toBe('user@#$%');
    });

    it('should handle very old timestamp', () => {
      const oldDate = new Date('1970-01-01');
      const event = new TokenRefreshedEvent(1, 'user', oldDate);

      expect(event.timestamp).toBe(oldDate);
    });

    it('should handle future timestamp', () => {
      const futureDate = new Date('2099-12-31');
      const event = new TokenRefreshedEvent(1, 'user', futureDate);

      expect(event.timestamp).toBe(futureDate);
    });
  });
});