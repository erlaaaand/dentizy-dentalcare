// backend/src/auth/applications/dto/__tests__/token-payload.dto.spec.ts
import { TokenPayloadDto } from '../token-payload.dto';

// ======================
// MOCK DATA
// ======================
const mockTokenPayload: TokenPayloadDto = {
  userId: 1,
  username: 'testuser',
  roles: ['staf', 'dokter'],
};

describe('TokenPayloadDto', () => {
  let dto: TokenPayloadDto;

  beforeEach(() => {
    dto = new TokenPayloadDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('DTO Structure Tests', () => {
    it('should have userId property', () => {
      dto.userId = mockTokenPayload.userId;
      expect(dto.userId).toBeDefined();
      expect(typeof dto.userId).toBe('number');
      expect(dto.userId).toBe(1);
    });

    it('should have username property', () => {
      dto.username = mockTokenPayload.username;
      expect(dto.username).toBeDefined();
      expect(typeof dto.username).toBe('string');
      expect(dto.username).toBe('testuser');
    });

    it('should have roles property', () => {
      dto.roles = mockTokenPayload.roles;
      expect(dto.roles).toBeDefined();
      expect(Array.isArray(dto.roles)).toBe(true);
      expect(dto.roles).toEqual(['staf', 'dokter']);
    });

    it('should accept complete valid data', () => {
      Object.assign(dto, mockTokenPayload);

      expect(dto.userId).toBe(mockTokenPayload.userId);
      expect(dto.username).toBe(mockTokenPayload.username);
      expect(dto.roles).toEqual(mockTokenPayload.roles);
    });
  });

  describe('UserId Tests', () => {
    it('should accept positive integer userId', () => {
      dto.userId = 42;
      expect(dto.userId).toBe(42);
      expect(typeof dto.userId).toBe('number');
    });

    it('should accept userId of 1', () => {
      dto.userId = 1;
      expect(dto.userId).toBe(1);
    });

    it('should accept large userId', () => {
      dto.userId = 999999;
      expect(dto.userId).toBe(999999);
    });
  });

  describe('Username Tests', () => {
    it('should accept alphanumeric username', () => {
      dto.username = 'user123';
      expect(dto.username).toBe('user123');
    });

    it('should accept username with underscore', () => {
      dto.username = 'user_name_123';
      expect(dto.username).toBe('user_name_123');
    });

    it('should accept short username', () => {
      dto.username = 'abc';
      expect(dto.username).toBe('abc');
    });

    it('should accept long username', () => {
      const longUsername = 'a'.repeat(50);
      dto.username = longUsername;
      expect(dto.username).toBe(longUsername);
    });
  });

  describe('Roles Array Tests', () => {
    it('should accept single role', () => {
      dto.roles = ['admin'];
      expect(dto.roles.length).toBe(1);
      expect(dto.roles[0]).toBe('admin');
    });

    it('should accept multiple roles', () => {
      dto.roles = ['admin', 'dokter', 'staf'];
      expect(dto.roles.length).toBe(3);
      expect(dto.roles).toContain('admin');
      expect(dto.roles).toContain('dokter');
      expect(dto.roles).toContain('staf');
    });

    it('should accept empty roles array', () => {
      dto.roles = [];
      expect(dto.roles.length).toBe(0);
      expect(Array.isArray(dto.roles)).toBe(true);
    });

    it('should maintain role order', () => {
      dto.roles = ['dokter', 'staf', 'admin'];
      expect(dto.roles[0]).toBe('dokter');
      expect(dto.roles[1]).toBe('staf');
      expect(dto.roles[2]).toBe('admin');
    });
  });

  describe('Complete Payload Tests', () => {
    it('should create complete token payload', () => {
      const payload: TokenPayloadDto = {
        userId: 5,
        username: 'newuser',
        roles: ['staf'],
      };

      expect(payload.userId).toBe(5);
      expect(payload.username).toBe('newuser');
      expect(payload.roles).toEqual(['staf']);
    });

    it('should create token payload with multiple roles', () => {
      const payload: TokenPayloadDto = {
        userId: 10,
        username: 'adminuser',
        roles: ['admin', 'dokter', 'staf'],
      };

      expect(payload.userId).toBe(10);
      expect(payload.username).toBe('adminuser');
      expect(payload.roles.length).toBe(3);
    });

    it('should create token payload with no roles', () => {
      const payload: TokenPayloadDto = {
        userId: 15,
        username: 'basicuser',
        roles: [],
      };

      expect(payload.userId).toBe(15);
      expect(payload.username).toBe('basicuser');
      expect(payload.roles.length).toBe(0);
    });
  });

  describe('JWT Integration Tests', () => {
    it('should represent data suitable for JWT encoding', () => {
      Object.assign(dto, mockTokenPayload);

      const jsonString = JSON.stringify(dto);
      const parsed = JSON.parse(jsonString);

      expect(parsed.userId).toBe(dto.userId);
      expect(parsed.username).toBe(dto.username);
      expect(parsed.roles).toEqual(dto.roles);
    });

    it('should not contain sensitive information', () => {
      Object.assign(dto, mockTokenPayload);
      expect(dto).not.toHaveProperty('password');
      expect(dto).not.toHaveProperty('email');
      expect(dto).not.toHaveProperty('token');
    });
  });
});
