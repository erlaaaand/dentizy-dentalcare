// backend/src/auth/applications/dto/__tests__/register-user.dto.spec.ts
import { validate } from 'class-validator';
import { RegisterUserDto } from '../register-user.dto';

// ======================
// MOCK DATA
// ======================
const validRegisterData = {
  nama_lengkap: 'John Doe',
  username: 'johndoe',
  password: 'StrongP@ssw0rd!',
  roles: [2], // ID untuk role 'staf'
};

describe('RegisterUserDto', () => {
  let dto: RegisterUserDto;

  beforeEach(() => {
    dto = new RegisterUserDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('Valid DTO Tests', () => {
    it('should pass validation with valid data', async () => {
      Object.assign(dto, validRegisterData);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept multiple roles', async () => {
      Object.assign(dto, { ...validRegisterData, roles: [1, 2, 3] });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Nama Lengkap Validation', () => {
    it('should fail when nama_lengkap is empty', async () => {
      Object.assign(dto, { ...validRegisterData, nama_lengkap: '' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nama_lengkap')).toBe(true);
    });

    it('should fail when nama_lengkap is not provided', async () => {
      dto.username = validRegisterData.username;
      dto.password = validRegisterData.password;
      dto.roles = validRegisterData.roles;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'nama_lengkap')).toBe(true);
    });

    it('should fail when nama_lengkap is not a string', async () => {
      Object.assign(dto, { ...validRegisterData, nama_lengkap: 12345 });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'nama_lengkap')).toBe(true);
    });

    it('should accept nama_lengkap with spaces', async () => {
      Object.assign(dto, {
        ...validRegisterData,
        nama_lengkap: 'John Michael Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Username Validation', () => {
    it('should fail when username is empty', async () => {
      Object.assign(dto, { ...validRegisterData, username: '' });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should fail when username is not provided', async () => {
      dto.nama_lengkap = validRegisterData.nama_lengkap;
      dto.password = validRegisterData.password;
      dto.roles = validRegisterData.roles;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should fail when username is not a string', async () => {
      Object.assign(dto, { ...validRegisterData, username: 12345 });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'username')).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should fail when password is empty', async () => {
      Object.assign(dto, { ...validRegisterData, password: '' });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password is not provided', async () => {
      dto.nama_lengkap = validRegisterData.nama_lengkap;
      dto.username = validRegisterData.username;
      dto.roles = validRegisterData.roles;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password is too short', async () => {
      Object.assign(dto, { ...validRegisterData, password: 'Short1!' });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password does not meet strength requirements', async () => {
      Object.assign(dto, { ...validRegisterData, password: 'weakpassword' });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept strong password with mixed characters', async () => {
      Object.assign(dto, { ...validRegisterData, password: 'Str0ng!P@ssw0rd' });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Roles Validation', () => {
    it('should fail when roles is empty array', async () => {
      Object.assign(dto, { ...validRegisterData, roles: [] });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'roles')).toBe(true);
    });

    it('should fail when roles is not provided', async () => {
      dto.nama_lengkap = validRegisterData.nama_lengkap;
      dto.username = validRegisterData.username;
      dto.password = validRegisterData.password;

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'roles')).toBe(true);
    });

    it('should fail when roles is not an array', async () => {
      Object.assign(dto, { ...validRegisterData, roles: 'not-array' });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'roles')).toBe(true);
    });

    it('should fail when roles contains non-number values', async () => {
      Object.assign(dto, { ...validRegisterData, roles: [1, 'two', 3] });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'roles')).toBe(true);
    });

    it('should accept array of role IDs', async () => {
      Object.assign(dto, { ...validRegisterData, roles: [1, 2] });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Complete Validation Tests', () => {
    it('should fail when all fields are missing', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('nama_lengkap');
      expect(properties).toContain('username');
      expect(properties).toContain('password');
      expect(properties).toContain('roles');
    });

    it('should create valid DTO with all required fields', () => {
      Object.assign(dto, validRegisterData);

      expect(dto.nama_lengkap).toBe(validRegisterData.nama_lengkap);
      expect(dto.username).toBe(validRegisterData.username);
      expect(dto.password).toBe(validRegisterData.password);
      expect(dto.roles).toEqual(validRegisterData.roles);
    });
  });
});
