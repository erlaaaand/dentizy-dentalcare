// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../../../applications/dto/create-user.dto'; // Sesuaikan path
import { PASSWORD_MIN_LENGTH } from '../../../../shared/validators/password.validator';

// 2. MOCK DATA
const validPassword = 'StrongPassword123!'; // Memenuhi syarat strong & min length
const validDtoData = {
  nama_lengkap: 'Dr. Stephen Strange',
  username: 'drstrange',
  password: validPassword,
  roles: [1, 2], // Array ID Role
};

// 3. TEST SUITE
describe('CreateUserDto', () => {

  // 4. SETUP AND TEARDOWN
  // DTO testing is mostly stateless.

  // 5. EXECUTE METHOD TESTS (Happy Path)

  it('should validate successfully with complete valid data', async () => {
    const dto = plainToInstance(CreateUserDto, validDtoData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  // 6. SUB-GROUP TESTS (Field Specific Validations)

  describe('nama_lengkap', () => {
    it('should fail if nama_lengkap is empty', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, nama_lengkap: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nama_lengkap');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if nama_lengkap is not a string', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, nama_lengkap: 123 });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('nama_lengkap');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('username', () => {
    it('should fail if username is empty', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, username: '' });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('username');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('password', () => {
    it('should fail if password is empty', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, password: '' });
      const errors = await validate(dto);

      const error = errors.find(e => e.property === 'password');
      expect(error).toBeDefined();
      expect(error?.constraints).toHaveProperty('isNotEmpty');
    });

    it(`should fail if password is shorter than ${PASSWORD_MIN_LENGTH} characters`, async () => {
      const shortPass = 'Str1!'; 
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, password: shortPass });
      const errors = await validate(dto);

      const error = errors.find(e => e.property === 'password');
      expect(error?.constraints).toHaveProperty('minLength');
      expect(error?.constraints?.minLength).toContain(`minimal ${PASSWORD_MIN_LENGTH} karakter`);
    });

    it('should fail if password is NOT strong (Integration with IsStrongPassword)', async () => {
      // Password panjang tapi lemah (hanya huruf kecil)
      const weakPass = 'passwordlemahsekali'; 
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, password: weakPass });
      const errors = await validate(dto);

      const error = errors.find(e => e.property === 'password');
      expect(error).toBeDefined();
      // Asumsi nama constraint default dari custom validator adalah camelCase dari nama decorator
      // atau nama spesifik yang Anda define di validator tersebut.
      // Biasanya: 'isStrongPassword'
      expect(Object.keys(error!.constraints!)).toContain('isStrongPassword');
    });
  });

  describe('roles', () => {
    it('should fail if roles is missing/empty', async () => {
      // Case: null/undefined
      let dto = plainToInstance(CreateUserDto, { ...validDtoData, roles: null });
      let errors = await validate(dto);
      expect(errors[0].property).toBe('roles');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');

      // Case: Empty array (jika IsNotEmpty mengecek array length > 0, tergantung config, 
      // tapi biasanya IsNotEmpty pada array mengecek keberadaan properti, bukan length. 
      // Untuk length biasanya pakai ArrayNotEmpty)
    });

    it('should fail if roles is not an array', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, roles: 'admin' }); // String instead of Array
      const errors = await validate(dto);

      expect(errors[0].property).toBe('roles');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail if roles contains non-number elements', async () => {
      // Decorator: @IsNumber({}, { each: true })
      const dto = plainToInstance(CreateUserDto, { ...validDtoData, roles: [1, '2', 3] }); // Ada string '2'
      const errors = await validate(dto);

      expect(errors[0].property).toBe('roles');
      // Error message biasanya "each value in roles must be a number..."
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });
  });
});