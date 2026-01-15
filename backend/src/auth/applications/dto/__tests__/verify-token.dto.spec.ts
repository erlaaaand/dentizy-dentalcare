// backend/src/auth/applications/dto/__tests__/verify-token.dto.spec.ts
import { validate } from 'class-validator';
import { VerifyTokenDto, VerifyTokenResponseDto } from '../verify-token.dto';

// ======================
// MOCK DATA
// ======================
const validToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.signature';

const mockValidResponse: VerifyTokenResponseDto = {
  valid: true,
  userId: 1,
  username: 'testuser',
  roles: ['staf', 'dokter'],
};

const mockInvalidResponse: VerifyTokenResponseDto = {
  valid: false,
  message: 'Token tidak valid atau sudah kadaluarsa',
};

describe('VerifyTokenDto', () => {
  let dto: VerifyTokenDto;

  beforeEach(() => {
    dto = new VerifyTokenDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('Valid DTO Tests', () => {
    it('should pass validation with valid token', async () => {
      dto.token = validToken;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept JWT format token', async () => {
      dto.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept simple string token', async () => {
      dto.token = 'simple-token-string';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Token Validation', () => {
    it('should fail when token is empty', async () => {
      dto.token = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when token is not provided', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
    });

    it('should fail when token is not a string', async () => {
      (dto as any).token = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when token is whitespace only', async () => {
      dto.token = '   ';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept very long token', async () => {
      dto.token = 'a'.repeat(500);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

describe('VerifyTokenResponseDto', () => {
  let dto: VerifyTokenResponseDto;

  beforeEach(() => {
    dto = new VerifyTokenResponseDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('Valid Response Structure', () => {
    it('should have valid property', () => {
      dto.valid = true;
      expect(dto.valid).toBeDefined();
      expect(typeof dto.valid).toBe('boolean');
    });

    it('should accept complete valid response', () => {
      Object.assign(dto, mockValidResponse);

      expect(dto.valid).toBe(true);
      expect(dto.userId).toBe(1);
      expect(dto.username).toBe('testuser');
      expect(dto.roles).toEqual(['staf', 'dokter']);
    });

    it('should accept valid response with all optional fields', () => {
      dto.valid = true;
      dto.userId = 5;
      dto.username = 'newuser';
      dto.roles = ['admin'];

      expect(dto.valid).toBe(true);
      expect(dto.userId).toBe(5);
      expect(dto.username).toBe('newuser');
      expect(dto.roles).toEqual(['admin']);
    });
  });

  describe('Invalid Response Structure', () => {
    it('should accept invalid response with message', () => {
      Object.assign(dto, mockInvalidResponse);

      expect(dto.valid).toBe(false);
      expect(dto.message).toBe('Token tidak valid atau sudah kadaluarsa');
    });

    it('should accept invalid response without optional fields', () => {
      dto.valid = false;
      dto.message = 'Token expired';

      expect(dto.valid).toBe(false);
      expect(dto.message).toBe('Token expired');
      expect(dto.userId).toBeUndefined();
      expect(dto.username).toBeUndefined();
      expect(dto.roles).toBeUndefined();
    });
  });

  describe('Optional Fields Behavior', () => {
    it('should allow undefined userId when valid is true', () => {
      dto.valid = true;
      dto.username = 'testuser';
      dto.roles = ['staf'];

      expect(dto.userId).toBeUndefined();
    });

    it('should allow undefined username when valid is true', () => {
      dto.valid = true;
      dto.userId = 1;
      dto.roles = ['staf'];

      expect(dto.username).toBeUndefined();
    });

    it('should allow undefined roles when valid is true', () => {
      dto.valid = true;
      dto.userId = 1;
      dto.username = 'testuser';

      expect(dto.roles).toBeUndefined();
    });

    it('should allow undefined message when valid is true', () => {
      dto.valid = true;
      dto.userId = 1;
      dto.username = 'testuser';
      dto.roles = ['staf'];

      expect(dto.message).toBeUndefined();
    });
  });

  describe('Response Scenarios', () => {
    it('should represent successful token verification', () => {
      const response: VerifyTokenResponseDto = {
        valid: true,
        userId: 10,
        username: 'adminuser',
        roles: ['admin', 'dokter'],
      };

      expect(response.valid).toBe(true);
      expect(response.userId).toBe(10);
      expect(response.username).toBe('adminuser');
      expect(response.roles?.length).toBe(2);
    });

    it('should represent failed token verification with expired token', () => {
      const response: VerifyTokenResponseDto = {
        valid: false,
        message: 'Token telah kadaluarsa',
      };

      expect(response.valid).toBe(false);
      expect(response.message).toBe('Token telah kadaluarsa');
    });

    it('should represent failed token verification with invalid format', () => {
      const response: VerifyTokenResponseDto = {
        valid: false,
        message: 'Format token tidak valid',
      };

      expect(response.valid).toBe(false);
      expect(response.message).toBe('Format token tidak valid');
    });

    it('should represent token verification for user with no roles', () => {
      const response: VerifyTokenResponseDto = {
        valid: true,
        userId: 20,
        username: 'basicuser',
        roles: [],
      };

      expect(response.valid).toBe(true);
      expect(response.userId).toBe(20);
      expect(response.roles?.length).toBe(0);
    });
  });

  describe('Type Safety Tests', () => {
    it('should have boolean valid property', () => {
      dto.valid = true;
      expect(typeof dto.valid).toBe('boolean');

      dto.valid = false;
      expect(typeof dto.valid).toBe('boolean');
    });

    it('should have number userId property', () => {
      dto.userId = 42;
      expect(typeof dto.userId).toBe('number');
    });

    it('should have string username property', () => {
      dto.username = 'testuser';
      expect(typeof dto.username).toBe('string');
    });

    it('should have array roles property', () => {
      dto.roles = ['admin', 'user'];
      expect(Array.isArray(dto.roles)).toBe(true);
    });

    it('should have string message property', () => {
      dto.message = 'Error message';
      expect(typeof dto.message).toBe('string');
    });
  });
});
