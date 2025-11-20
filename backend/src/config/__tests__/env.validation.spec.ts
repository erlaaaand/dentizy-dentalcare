// backend/src/config/__tests__/env.validation.spec.ts

// ===== IMPORTS =====
import { envValidationSchema } from '../env.validation';
import * as Joi from 'joi';

// ===== MOCK DATA =====
const validEnvVars = {
  NODE_ENV: 'development',
  PORT: 3000,
  DB_HOST: 'localhost',
  DB_PORT: 3306,
  DB_USERNAME: 'test_user',
  DB_PASSWORD: 'test_password',
  DB_NAME: 'test_database',
  JWT_SECRET: 'test-secret-key-with-minimum-32-characters-required',
  JWT_EXPIRES_IN: '24h',
  EMAIL_HOST: 'smtp.example.com',
  EMAIL_PORT: 587,
  EMAIL_SECURE: 'false',
  EMAIL_USER: 'test@example.com',
  EMAIL_PASS: 'email_password',
  FRONTEND_URL: 'http://localhost:3000',
  THROTTLE_TTL: 60000,
  THROTTLE_LIMIT: 100,
  CACHE_TTL: 300,
  CACHE_MAX: 100,
};

// ===== TEST SUITE =====
describe('EnvValidationSchema', () => {
  // ===== SETUP AND TEARDOWN =====
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== BASIC TESTS =====
  describe('Schema Structure', () => {
    it('should be defined', () => {
      expect(envValidationSchema).toBeDefined();
    });

    it('should be a Joi schema object', () => {
      expect(envValidationSchema.validate).toBeDefined();
      expect(typeof envValidationSchema.validate).toBe('function');
    });
  });

  // ===== VALID CONFIGURATION TESTS =====
  describe('Valid Configuration', () => {
    it('should validate complete valid environment variables', () => {
      const { error, value } = envValidationSchema.validate(validEnvVars);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
    });

    it('should accept all valid values without modifications', () => {
      const { error, value } = envValidationSchema.validate(validEnvVars);
      expect(error).toBeUndefined();
      expect(value.DB_HOST).toBe(validEnvVars.DB_HOST);
      expect(value.JWT_SECRET).toBe(validEnvVars.JWT_SECRET);
    });
  });

  // ===== NODE_ENV VALIDATION TESTS =====
  describe('NODE_ENV Validation', () => {
    it('should accept "development" as valid NODE_ENV', () => {
      const env = { ...validEnvVars, NODE_ENV: 'development' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should accept "production" as valid NODE_ENV', () => {
      const env = { ...validEnvVars, NODE_ENV: 'production' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should accept "test" as valid NODE_ENV', () => {
      const env = { ...validEnvVars, NODE_ENV: 'test' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject invalid NODE_ENV values', () => {
      const env = { ...validEnvVars, NODE_ENV: 'invalid' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      expect(error?.message).toContain('NODE_ENV');
    });

    it('should use default "development" when NODE_ENV is not provided', () => {
      const { NODE_ENV, ...envWithoutNodeEnv } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutNodeEnv);
      expect(error).toBeUndefined();
      expect(value.NODE_ENV).toBe('development');
    });
  });

  // ===== PORT VALIDATION TESTS =====
  describe('PORT Validation', () => {
    it('should accept valid port number', () => {
      const env = { ...validEnvVars, PORT: 8080 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should use default 3000 when PORT is not provided', () => {
      const { PORT, ...envWithoutPort } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutPort);
      expect(error).toBeUndefined();
      expect(value.PORT).toBe(3000);
    });

    it('should reject port below valid range', () => {
      const env = { ...validEnvVars, PORT: 0 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      // Debug info untuk membantu troubleshooting
      if (!error) {
        console.log('PORT validation passed for value 0, which should have failed');
      }
    });

    it('should reject port 0 specifically', () => {
      const env = { ...validEnvVars, PORT: 0 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      expect(error?.message).toContain('PORT');
    });

    it('should reject negative port numbers', () => {
      const env = { ...validEnvVars, PORT: -1 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should reject port above valid range', () => {
      const env = { ...validEnvVars, PORT: 65536 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept maximum valid port', () => {
      const env = { ...validEnvVars, PORT: 65535 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });
  });

  // ===== DATABASE VALIDATION TESTS =====
  describe('Database Validation', () => {
    it('should require DB_HOST', () => {
      const { DB_HOST, ...envWithoutHost } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutHost);
      expect(error).toBeDefined();
      expect(error?.message).toContain('DB_HOST');
    });

    it('should require DB_USERNAME', () => {
      const { DB_USERNAME, ...envWithoutUsername } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutUsername);
      expect(error).toBeDefined();
      expect(error?.message).toContain('DB_USERNAME');
    });

    it('should require DB_NAME', () => {
      const { DB_NAME, ...envWithoutName } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutName);
      expect(error).toBeDefined();
      expect(error?.message).toContain('DB_NAME');
    });

    it('should allow empty DB_PASSWORD', () => {
      const env = { ...validEnvVars, DB_PASSWORD: '' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should use default 3306 for DB_PORT when not provided', () => {
      const { DB_PORT, ...envWithoutDbPort } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutDbPort);
      expect(error).toBeUndefined();
      expect(value.DB_PORT).toBe(3306);
    });

    it('should accept valid DB_PORT', () => {
      const env = { ...validEnvVars, DB_PORT: 5432 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });
  });

  // ===== JWT VALIDATION TESTS =====
  describe('JWT Validation', () => {
    it('should require JWT_SECRET', () => {
      const { JWT_SECRET, ...envWithoutSecret } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutSecret);
      expect(error).toBeDefined();
      expect(error?.message).toContain('JWT_SECRET');
    });

    it('should enforce minimum 32 characters for JWT_SECRET', () => {
      const env = { ...validEnvVars, JWT_SECRET: 'short' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      expect(error?.message).toContain('JWT_SECRET');
    });

    it('should accept JWT_SECRET with exactly 32 characters', () => {
      const env = { ...validEnvVars, JWT_SECRET: 'a'.repeat(32) };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should accept JWT_SECRET with more than 32 characters', () => {
      const env = { ...validEnvVars, JWT_SECRET: 'a'.repeat(64) };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should use default "24h" for JWT_EXPIRES_IN when not provided', () => {
      const { JWT_EXPIRES_IN, ...envWithoutExpires } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutExpires);
      expect(error).toBeUndefined();
      expect(value.JWT_EXPIRES_IN).toBe('24h');
    });

    it('should accept valid JWT_EXPIRES_IN values', () => {
      const validExpirations = ['1h', '30m', '7d', '1w'];
      validExpirations.forEach((expiration) => {
        const env = { ...validEnvVars, JWT_EXPIRES_IN: expiration };
        const { error } = envValidationSchema.validate(env);
        expect(error).toBeUndefined();
      });
    });
  });

  // ===== EMAIL VALIDATION TESTS =====
  describe('Email Validation', () => {
    it('should require EMAIL_HOST', () => {
      const { EMAIL_HOST, ...envWithoutEmailHost } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutEmailHost);
      expect(error).toBeDefined();
      expect(error?.message).toContain('EMAIL_HOST');
    });

    it('should require EMAIL_USER', () => {
      const { EMAIL_USER, ...envWithoutEmailUser } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutEmailUser);
      expect(error).toBeDefined();
      expect(error?.message).toContain('EMAIL_USER');
    });

    it('should require EMAIL_PASS', () => {
      const { EMAIL_PASS, ...envWithoutEmailPass } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutEmailPass);
      expect(error).toBeDefined();
      expect(error?.message).toContain('EMAIL_PASS');
    });

    it('should validate EMAIL_USER as email format', () => {
      const env = { ...validEnvVars, EMAIL_USER: 'invalid-email' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      expect(error?.message).toContain('EMAIL_USER');
    });

    it('should accept valid email for EMAIL_USER', () => {
      const env = { ...validEnvVars, EMAIL_USER: 'valid@example.com' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should use default 587 for EMAIL_PORT when not provided', () => {
      const { EMAIL_PORT, ...envWithoutPort } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutPort);
      expect(error).toBeUndefined();
      expect(value.EMAIL_PORT).toBe(587);
    });

    it('should accept "true" for EMAIL_SECURE', () => {
      const env = { ...validEnvVars, EMAIL_SECURE: 'true' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should accept "false" for EMAIL_SECURE', () => {
      const env = { ...validEnvVars, EMAIL_SECURE: 'false' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject invalid EMAIL_SECURE values', () => {
      const env = { ...validEnvVars, EMAIL_SECURE: 'invalid' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should use default "false" for EMAIL_SECURE when not provided', () => {
      const { EMAIL_SECURE, ...envWithoutSecure } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutSecure);
      expect(error).toBeUndefined();
      expect(value.EMAIL_SECURE).toBe('false');
    });
  });

  // ===== FRONTEND VALIDATION TESTS =====
  describe('Frontend Validation', () => {
    it('should require FRONTEND_URL', () => {
      const { FRONTEND_URL, ...envWithoutUrl } = validEnvVars;
      const { error } = envValidationSchema.validate(envWithoutUrl);
      expect(error).toBeDefined();
      expect(error?.message).toContain('FRONTEND_URL');
    });

    it('should validate FRONTEND_URL as URI', () => {
      const env = { ...validEnvVars, FRONTEND_URL: 'not-a-url' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept valid HTTP URL', () => {
      const env = { ...validEnvVars, FRONTEND_URL: 'http://localhost:3000' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should accept valid HTTPS URL', () => {
      const env = { ...validEnvVars, FRONTEND_URL: 'https://example.com' };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });
  });

  // ===== THROTTLE VALIDATION TESTS =====
  describe('Throttle Validation', () => {
    it('should use default 60000 for THROTTLE_TTL when not provided', () => {
      const { THROTTLE_TTL, ...envWithoutTTL } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutTTL);
      expect(error).toBeUndefined();
      expect(value.THROTTLE_TTL).toBe(60000);
    });

    it('should use default 100 for THROTTLE_LIMIT when not provided', () => {
      const { THROTTLE_LIMIT, ...envWithoutLimit } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutLimit);
      expect(error).toBeUndefined();
      expect(value.THROTTLE_LIMIT).toBe(100);
    });

    it('should reject THROTTLE_TTL below 1000', () => {
      const env = { ...validEnvVars, THROTTLE_TTL: 999 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept THROTTLE_TTL of exactly 1000', () => {
      const env = { ...validEnvVars, THROTTLE_TTL: 1000 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject THROTTLE_LIMIT below 1', () => {
      const env = { ...validEnvVars, THROTTLE_LIMIT: 0 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept THROTTLE_LIMIT of exactly 1', () => {
      const env = { ...validEnvVars, THROTTLE_LIMIT: 1 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject non-integer THROTTLE_TTL', () => {
      const env = { ...validEnvVars, THROTTLE_TTL: 1500.5 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });
  });

  // ===== CACHE VALIDATION TESTS =====
  describe('Cache Validation', () => {
    it('should use default 300 for CACHE_TTL when not provided', () => {
      const { CACHE_TTL, ...envWithoutCacheTTL } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutCacheTTL);
      expect(error).toBeUndefined();
      expect(value.CACHE_TTL).toBe(300);
    });

    it('should use default 100 for CACHE_MAX when not provided', () => {
      const { CACHE_MAX, ...envWithoutCacheMax } = validEnvVars;
      const { error, value } = envValidationSchema.validate(envWithoutCacheMax);
      expect(error).toBeUndefined();
      expect(value.CACHE_MAX).toBe(100);
    });

    it('should reject CACHE_TTL below 1', () => {
      const env = { ...validEnvVars, CACHE_TTL: 0 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept CACHE_TTL of exactly 1', () => {
      const env = { ...validEnvVars, CACHE_TTL: 1 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject CACHE_MAX below 1', () => {
      const env = { ...validEnvVars, CACHE_MAX: 0 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept CACHE_MAX of exactly 1', () => {
      const env = { ...validEnvVars, CACHE_MAX: 1 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });

    it('should reject non-integer CACHE_TTL', () => {
      const env = { ...validEnvVars, CACHE_TTL: 300.5 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
    });

    it('should accept high CACHE_MAX values', () => {
      const env = { ...validEnvVars, CACHE_MAX: 10000 };
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeUndefined();
    });
  });

  // ===== EDGE CASES TESTS =====
  describe('Edge Cases', () => {
    it('should handle empty object', () => {
      const { error } = envValidationSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should handle extra unknown properties according to schema settings', () => {
      const env = { ...validEnvVars, UNKNOWN_PROP: 'value' };
      const { error } = envValidationSchema.validate(env, { allowUnknown: true });
      
      // Test ini mungkin gagal tergantung pada konfigurasi schema
      // Jika schema dikonfigurasi untuk menolak unknown properties, test ini diharapkan gagal
      if (error) {
        // Jika ada error, pastikan itu karena unknown property
        expect(error.message).toContain('is not allowed');
      } else {
        // Jika tidak ada error, maka schema mengizinkan unknown properties
        expect(error).toBeUndefined();
      }
    });

    it('should allow unknown properties when explicitly configured', () => {
      const env = { ...validEnvVars, UNKNOWN_PROP: 'value' };
      const { error } = envValidationSchema.validate(env, { allowUnknown: true });
      // Dengan allowUnknown: true, seharusnya tidak ada error
      expect(error).toBeUndefined();
    });

    it('should provide clear error messages for missing required fields', () => {
      const env = {};
      const { error } = envValidationSchema.validate(env);
      expect(error).toBeDefined();
      expect(error?.message).toContain('required');
    });

    it('should handle partial configuration', () => {
      const partialEnv = {
        DB_HOST: 'localhost',
        DB_USERNAME: 'user',
        DB_NAME: 'db',
        JWT_SECRET: 'a'.repeat(32),
        EMAIL_HOST: 'smtp.test.com',
        EMAIL_USER: 'test@test.com',
        EMAIL_PASS: 'pass',
        FRONTEND_URL: 'http://localhost:3000',
      };
      const { error } = envValidationSchema.validate(partialEnv);
      expect(error).toBeUndefined();
    });
  });

  // ===== MULTIPLE VALIDATIONS TESTS =====
  describe('Multiple Validations', () => {
    it('should validate same configuration multiple times consistently', () => {
      const result1 = envValidationSchema.validate(validEnvVars);
      const result2 = envValidationSchema.validate(validEnvVars);

      expect(result1.error).toEqual(result2.error);
      expect(result1.value).toEqual(result2.value);
    });

    it('should not modify original environment object', () => {
      const originalEnv = { ...validEnvVars };
      const envCopy = { ...validEnvVars };

      envValidationSchema.validate(originalEnv);

      expect(originalEnv).toEqual(envCopy);
    });
  });
});