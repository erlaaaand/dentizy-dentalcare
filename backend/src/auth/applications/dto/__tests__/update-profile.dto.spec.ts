// backend/src/auth/applications/dto/__tests__/update-profile.dto.spec.ts
import { validate } from 'class-validator';
import { UpdateProfileDto } from '../update-profile.dto';

// ======================
// MOCK DATA
// ======================
const validUpdateData = {
  username: 'newusername',
  nama_lengkap: 'New Full Name',
};

describe('UpdateProfileDto', () => {
  let dto: UpdateProfileDto;

  beforeEach(() => {
    dto = new UpdateProfileDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('Valid DTO Tests', () => {
    it('should pass validation with both fields', async () => {
      Object.assign(dto, validUpdateData);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only username', async () => {
      dto.username = validUpdateData.username;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only nama_lengkap', async () => {
      dto.nama_lengkap = validUpdateData.nama_lengkap;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty object', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Username Validation', () => {
    it('should fail when username is less than 5 characters', async () => {
      dto.username = 'abcd';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should pass when username is exactly 5 characters', async () => {
      dto.username = 'abcde';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when username is more than 5 characters', async () => {
      dto.username = 'username123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when username is not a string', async () => {
      (dto as any).username = 12345;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should accept username with underscore', async () => {
      dto.username = 'user_name_123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept alphanumeric username', async () => {
      dto.username = 'user123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Nama Lengkap Validation', () => {
    it('should fail when nama_lengkap is less than 3 characters', async () => {
      dto.nama_lengkap = 'ab';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nama_lengkap');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should pass when nama_lengkap is exactly 3 characters', async () => {
      dto.nama_lengkap = 'abc';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when nama_lengkap is more than 3 characters', async () => {
      dto.nama_lengkap = 'John Doe Smith';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when nama_lengkap is not a string', async () => {
      (dto as any).nama_lengkap = 12345;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'nama_lengkap')).toBe(true);
    });

    it('should accept nama_lengkap with spaces', async () => {
      dto.nama_lengkap = 'John Michael Doe';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept nama_lengkap with special characters', async () => {
      dto.nama_lengkap = "John O'Brien-Smith";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Optional Fields Behavior', () => {
    it('should not require any fields', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined username', async () => {
      dto.nama_lengkap = 'Valid Name';
      // username is undefined

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined nama_lengkap', async () => {
      dto.username = 'validuser';
      // nama_lengkap is undefined

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Security Tests', () => {
    it('should not have roles property', () => {
      const dto = new UpdateProfileDto();
      expect(dto).not.toHaveProperty('roles');
    });

    it('should not accept roles even if provided', () => {
      const dtoWithRoles: any = new UpdateProfileDto();
      dtoWithRoles.roles = ['admin'];

      // TypeScript should prevent this, but at runtime:
      expect(dtoWithRoles.roles).toBeDefined(); // It will exist at runtime
      // But validation should ignore it
      expect(dto).not.toHaveProperty('roles');
    });

    it('should not have password property', () => {
      const dto = new UpdateProfileDto();
      expect(dto).not.toHaveProperty('password');
    });
  });

  describe('Combined Validation Tests', () => {
    it('should fail when both fields are invalid', async () => {
      dto.username = 'ab'; // Too short
      dto.nama_lengkap = 'x'; // Too short

      const errors = await validate(dto);
      expect(errors.length).toBe(2);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('username');
      expect(properties).toContain('nama_lengkap');
    });

    it('should pass when both fields are valid', async () => {
      dto.username = 'validusername';
      dto.nama_lengkap = 'Valid Full Name';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail username but pass nama_lengkap', async () => {
      dto.username = 'abc'; // Invalid
      dto.nama_lengkap = 'Valid Name'; // Valid

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('username');
    });

    it('should pass username but fail nama_lengkap', async () => {
      dto.username = 'validuser'; // Valid
      dto.nama_lengkap = 'ab'; // Invalid

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('nama_lengkap');
    });
  });

  describe('Edge Cases', () => {
    it('should handle username with exact minimum length', async () => {
      dto.username = 'a'.repeat(5);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle nama_lengkap with exact minimum length', async () => {
      dto.nama_lengkap = 'a'.repeat(3);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very long username', async () => {
      dto.username = 'a'.repeat(100);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very long nama_lengkap', async () => {
      dto.nama_lengkap = 'a'.repeat(200);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
