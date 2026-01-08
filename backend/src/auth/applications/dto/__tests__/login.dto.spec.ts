// backend/src/auth/applications/dto/__tests__/login.dto.spec.ts
import { validate } from 'class-validator';
import { LoginDto } from '../login.dto';

// ======================
// MOCK DATA
// ======================
const validLoginData = {
  username: 'testuser',
  password: 'Password123!',
};

describe('LoginDto', () => {
  let dto: LoginDto;

  beforeEach(() => {
    dto = new LoginDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('Valid DTO Tests', () => {
    it('should pass validation with valid data', async () => {
      dto.username = validLoginData.username;
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept alphanumeric username', async () => {
      dto.username = 'user123';
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept username with underscore', async () => {
      dto.username = 'user_name_123';
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Username Validation', () => {
    it('should fail when username is empty', async () => {
      dto.username = '';
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when username is not provided', async () => {
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });

    it('should fail when username is not a string', async () => {
      (dto as any).username = 12345;
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when username is only whitespace', async () => {
      dto.username = '   ';
      dto.password = validLoginData.password;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Password Validation', () => {
    it('should fail when password is empty', async () => {
      dto.username = validLoginData.username;
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when password is not provided', async () => {
      dto.username = validLoginData.username;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail when password is not a string', async () => {
      dto.username = validLoginData.username;
      (dto as any).password = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should accept any string as password during login', async () => {
      dto.username = validLoginData.username;
      dto.password = 'any';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Multiple Field Validation', () => {
    it('should fail when both username and password are missing', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(2);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('username');
      expect(properties).toContain('password');
    });

    it('should fail when both username and password are empty', async () => {
      dto.username = '';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });
  });
});
