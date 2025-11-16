// backend/src/config/__tests__/database.config.spec.ts

// ===== IMPORTS =====
import databaseConfig from '../database.config';

// ===== MOCK DATA =====
const mockEnvVars = {
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USERNAME: 'test_user',
  DB_PASSWORD: 'test_password',
  DB_NAME: 'test_database',
};

// ===== TEST SUITE =====
describe('DatabaseConfig', () => {
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
      expect(databaseConfig).toBeDefined();
    });

    it('should return a configuration object', () => {
      const config = databaseConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have all required database properties', () => {
      const config = databaseConfig();
      expect(config).toHaveProperty('host');
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('username');
      expect(config).toHaveProperty('password');
      expect(config).toHaveProperty('database');
    });
  });

  // ===== CONFIGURATION VALUES TESTS =====
  describe('Configuration Values', () => {
    it('should return correct host from environment variable', () => {
      const config = databaseConfig();
      expect(config.host).toBe(mockEnvVars.DB_HOST);
    });

    it('should return correct port as number from environment variable', () => {
      const config = databaseConfig();
      expect(config.port).toBe(3306);
      expect(typeof config.port).toBe('number');
    });

    it('should return correct username from environment variable', () => {
      const config = databaseConfig();
      expect(config.username).toBe(mockEnvVars.DB_USERNAME);
    });

    it('should return correct password from environment variable', () => {
      const config = databaseConfig();
      expect(config.password).toBe(mockEnvVars.DB_PASSWORD);
    });

    it('should return correct database name from environment variable', () => {
      const config = databaseConfig();
      expect(config.database).toBe(mockEnvVars.DB_NAME);
    });
  });

  // ===== DEFAULT VALUES TESTS =====
  describe('Default Values', () => {
    it('should use default port 3306 when DB_PORT is not provided', () => {
      delete process.env.DB_PORT;
      const config = databaseConfig();
      expect(config.port).toBe(3306);
    });

    it('should use default port 3306 when DB_PORT is empty string', () => {
      process.env.DB_PORT = '';
      const config = databaseConfig();
      expect(config.port).toBe(3306);
    });

    it('should use default port 3306 when DB_PORT is invalid', () => {
      process.env.DB_PORT = 'invalid';
      const config = databaseConfig();
      expect(config.port).toBe(3306);
    });
  });

  // ===== EDGE CASES TESTS =====
  describe('Edge Cases', () => {
    it('should handle undefined host', () => {
      delete process.env.DB_HOST;
      const config = databaseConfig();
      expect(config.host).toBeUndefined();
    });

    it('should handle undefined username', () => {
      delete process.env.DB_USERNAME;
      const config = databaseConfig();
      expect(config.username).toBeUndefined();
    });

    it('should handle undefined password', () => {
      delete process.env.DB_PASSWORD;
      const config = databaseConfig();
      expect(config.password).toBeUndefined();
    });

    it('should handle undefined database name', () => {
      delete process.env.DB_NAME;
      const config = databaseConfig();
      expect(config.database).toBeUndefined();
    });

    it('should handle empty string password', () => {
      process.env.DB_PASSWORD = '';
      const config = databaseConfig();
      expect(config.password).toBe('');
    });

    it('should parse custom port correctly', () => {
      process.env.DB_PORT = '5432';
      const config = databaseConfig();
      expect(config.port).toBe(5432);
    });

    it('should handle port as string with whitespace', () => {
      process.env.DB_PORT = ' 3306 ';
      const config = databaseConfig();
      expect(config.port).toBe(3306);
    });
  });

  // ===== TYPE VALIDATION TESTS =====
  describe('Type Validation', () => {
    it('should return string type for host', () => {
      const config = databaseConfig();
      expect(typeof config.host).toBe('string');
    });

    it('should return number type for port', () => {
      const config = databaseConfig();
      expect(typeof config.port).toBe('number');
    });

    it('should return string type for username', () => {
      const config = databaseConfig();
      expect(typeof config.username).toBe('string');
    });

    it('should return string type for password', () => {
      const config = databaseConfig();
      expect(typeof config.password).toBe('string');
    });

    it('should return string type for database', () => {
      const config = databaseConfig();
      expect(typeof config.database).toBe('string');
    });
  });

  // ===== MULTIPLE CALLS TESTS =====
  describe('Multiple Calls', () => {
    it('should return consistent values on multiple calls', () => {
      const config1 = databaseConfig();
      const config2 = databaseConfig();

      expect(config1.host).toBe(config2.host);
      expect(config1.port).toBe(config2.port);
      expect(config1.username).toBe(config2.username);
      expect(config1.password).toBe(config2.password);
      expect(config1.database).toBe(config2.database);
    });

    it('should reflect environment changes between calls', () => {
      const config1 = databaseConfig();
      expect(config1.host).toBe('localhost');

      process.env.DB_HOST = 'newhost';
      const config2 = databaseConfig();
      expect(config2.host).toBe('newhost');
    });
  });
});