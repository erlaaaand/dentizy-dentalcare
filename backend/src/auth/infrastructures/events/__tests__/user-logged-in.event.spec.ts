import { UserLoggedInEvent } from '../user-logged-in.event';

describe('UserLoggedInEvent', () => {
  it('should be defined', () => {
    expect(UserLoggedInEvent).toBeDefined();
  });

  describe('Constructor', () => {
    it('should create event with all parameters', () => {
      const event = new UserLoggedInEvent(
        1,
        'testuser',
        new Date(),
        '127.0.0.1',
        'TestAgent/1.0',
      );

      expect(event.userId).toBe(1);
      expect(event.username).toBe('testuser');
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.ipAddress).toBe('127.0.0.1');
      expect(event.userAgent).toBe('TestAgent/1.0');
    });

    it('should create event without optional parameters', () => {
      const event = new UserLoggedInEvent(1, 'testuser');

      expect(event.userId).toBe(1);
      expect(event.username).toBe('testuser');
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.ipAddress).toBeUndefined();
      expect(event.userAgent).toBeUndefined();
    });

    it('should create event with custom timestamp', () => {
      const customDate = new Date('2023-01-01');
      const event = new UserLoggedInEvent(1, 'testuser', customDate);

      expect(event.timestamp).toBe(customDate);
    });

    it('should create event with default timestamp', () => {
      const before = Date.now();
      const event = new UserLoggedInEvent(1, 'testuser');
      const after = Date.now();

      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(before);
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('Properties', () => {
    it('should have readonly userId', () => {
      const event = new UserLoggedInEvent(1, 'testuser');

      expect(event.userId).toBe(1);
      expect(() => {
        (event as any).userId = 2;
      }).toThrow();
    });

    it('should have readonly username', () => {
      const event = new UserLoggedInEvent(1, 'testuser');

      expect(event.username).toBe('testuser');
      expect(() => {
        (event as any).username = 'other';
      }).toThrow();
    });

    it('should store userId correctly', () => {
      const event = new UserLoggedInEvent(123, 'user');

      expect(event.userId).toBe(123);
    });

    it('should store username correctly', () => {
      const event = new UserLoggedInEvent(1, 'myusername');

      expect(event.username).toBe('myusername');
    });

    it('should store ipAddress when provided', () => {
      const event = new UserLoggedInEvent(
        1,
        'user',
        new Date(),
        '192.168.1.1',
      );

      expect(event.ipAddress).toBe('192.168.1.1');
    });

    it('should store userAgent when provided', () => {
      const event = new UserLoggedInEvent(
        1,
        'user',
        new Date(),
        undefined,
        'Mozilla/5.0',
      );

      expect(event.userAgent).toBe('Mozilla/5.0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle userId of 0', () => {
      const event = new UserLoggedInEvent(0, 'user');

      expect(event.userId).toBe(0);
    });

    it('should handle negative userId', () => {
      const event = new UserLoggedInEvent(-1, 'user');

      expect(event.userId).toBe(-1);
    });

    it('should handle empty username', () => {
      const event = new UserLoggedInEvent(1, '');

      expect(event.username).toBe('');
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(1000);
      const event = new UserLoggedInEvent(1, longUsername);

      expect(event.username).toBe(longUsername);
    });

    it('should handle IPv6 address', () => {
      const event = new UserLoggedInEvent(
        1,
        'user',
        new Date(),
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      );

      expect(event.ipAddress).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    it('should handle very long user agent', () => {
      const longAgent = 'Agent'.repeat(100);
      const event = new UserLoggedInEvent(
        1,
        'user',
        new Date(),
        undefined,
        longAgent,
      );

      expect(event.userAgent).toBe(longAgent);
    });
  });
});