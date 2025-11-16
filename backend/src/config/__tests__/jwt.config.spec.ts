// backend/src/config/__tests__/jwt.config.spec.ts

// ===== IMPORTS =====
import jwtConfig from '../jwt.config';

// ===== MOCK DATA =====
const mockEnvVars = {
  JWT_SECRET: 'test-secret-key-with-minimum-32-characters',
  JWT_EXPIRES_IN: '1h',
};

// ===== TEST SUITE =====
describe('JwtConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  // ===== SETUP AND TEARDOWN =====
  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, ...mockEnvVars };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  // ===== BASIC TESTS =====
  describe('Configuration Structure', () => {
    it('should be defined', () => {
      expect(jwtConfig).toBeDefined();
    });

    it('should return a configuration object', () => {
      const config = jwtConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have all required JWT properties', () => {
      const config = jwtConfig();
      expect(config).toHaveProperty('secret');
      expect(config).toHaveProperty('expiresIn');
    });
  });

  // ===== CONFIGURATION VALUES TESTS =====
  describe('Configuration Values', () => {
    it('should return correct secret from environment variable', () => {
      const config = jwtConfig();
      expect(config.secret).toBe(mockEnvVars.JWT_SECRET);
    });

    it('should return correct expiresIn from environment variable', () => {
      const config = jwtConfig();
      expect(config.expiresIn).toBe(mockEnvVars.JWT_EXPIRES_IN);
    });
  });

  // ===== DEFAULT VALUES TESTS =====
  describe('Default Values', () => {
    it('should use default expiresIn "24h" when JWT_EXPIRES_IN is not provided', () => {
      delete process.env.JWT_EXPIRES_IN;
      const config = jwtConfig();
      expect(config.expiresIn).toBe('24h');
    });

    it('should use default expiresIn "24h" when JWT_EXPIRES_IN is empty string', () => {
      process.env.JWT_EXPIRES_IN = '';
      const config = jwtConfig();
      expect(config.expiresIn).toBe('24h');
    });

    it('should use default expiresIn "24h" when JWT_EXPIRES_IN is undefined', () => {
      process.env.JWT_EXPIRES_IN = undefined;
      const config = jwtConfig();
      expect(config.expiresIn).toBe('24h');
    });
  });

  // ===== EDGE CASES TESTS =====
  describe('Edge Cases', () => {
    it('should handle undefined JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      const config = jwtConfig();
      expect(config.secret).toBeUndefined();
    });

    it('should handle empty string JWT_SECRET', () => {
      process.env.JWT_SECRET = '';
      const config = jwtConfig();
      expect(config.secret).toBe('');
    });

    it('should accept various time formats for expiresIn', () => {
      const timeFormats = ['1h', '30m', '7d', '1w', '60s', '60', '2.5h'];

      timeFormats.forEach((format) => {
        process.env.JWT_EXPIRES_IN = format;
        const config = jwtConfig();
        expect(config.expiresIn).toBe(format);
      });
    });

    it('should handle very long secret keys', () => {
      const longSecret = 'a'.repeat(256);
      process.env.JWT_SECRET = longSecret;
      const config = jwtConfig();
      expect(config.secret).toBe(longSecret);
      expect(config.secret?.length).toBe(256);
    });

    it('should handle secret with special characters', () => {
      const specialSecret = 'test!@#$%^&*()_+-=[]{}|;:,.<>?';
      process.env.JWT_SECRET = specialSecret;
      const config = jwtConfig();
      expect(config.secret).toBe(specialSecret);
    });
  });

  // ===== TYPE VALIDATION TESTS =====
  describe('Type Validation', () => {
    it('should return string type for secret', () => {
      const config = jwtConfig();
      expect(typeof config.secret).toBe('string');
    });

    it('should return string type for expiresIn', () => {
      const config = jwtConfig();
      expect(typeof config.expiresIn).toBe('string');
    });
  });

  // ===== MULTIPLE CALLS TESTS =====
  describe('Multiple Calls', () => {
    it('should return consistent values on multiple calls', () => {
      const config1 = jwtConfig();
      const config2 = jwtConfig();

      expect(config1.secret).toBe(config2.secret);
      expect(config1.expiresIn).toBe(config2.expiresIn);
    });

    it('should reflect environment changes between calls', () => {
      const config1 = jwtConfig();
      expect(config1.secret).toBe(mockEnvVars.JWT_SECRET);

      process.env.JWT_SECRET = 'new-secret-key-for-testing-purposes';
      const config2 = jwtConfig();
      expect(config2.secret).toBe('new-secret-key-for-testing-purposes');
    });

    it('should reflect expiresIn changes between calls', () => {
      const config1 = jwtConfig();
      expect(config1.expiresIn).toBe('1h');

      process.env.JWT_EXPIRES_IN = '2h';
      const config2 = jwtConfig();
      expect(config2.expiresIn).toBe('2h');
    });
  });

  // ===== SECURITY TESTS =====
  describe('Security Considerations', () => {
    it('should handle secrets with minimum length', () => {
      const minSecret = 'a'.repeat(32);
      process.env.JWT_SECRET = minSecret;
      const config = jwtConfig();
      expect(config.secret?.length).toBeGreaterThanOrEqual(32);
    });

    it('should preserve secret exactly as provided', () => {
      const exactSecret = 'MyExactSecret123!@#';
      process.env.JWT_SECRET = exactSecret;
      const config = jwtConfig();
      expect(config.secret).toBe(exactSecret);
    });
  });

  // ===== COMMON EXPIRATION FORMATS TESTS =====
  describe('Common Expiration Formats', () => {
    const expirationTestCases = [
      { format: '15m', description: '15 minutes' },
      { format: '30m', description: '30 minutes' },
      { format: '1h', description: '1 hour' },
      { format: '2h', description: '2 hours' },
      { format: '12h', description: '12 hours' },
      { format: '24h', description: '24 hours (1 day)' },
      { format: '7d', description: '7 days (1 week)' },
      { format: '30d', description: '30 days (1 month)' },
    ];

    expirationTestCases.forEach(({ format, description }) => {
      it(`should accept ${description} format: "${format}"`, () => {
        process.env.JWT_EXPIRES_IN = format;
        const config = jwtConfig();
        expect(config.expiresIn).toBe(format);
      });
    });
  });
});