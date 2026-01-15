// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChangePasswordDto } from '../../../applications/dto/change-password.dto'; // Sesuaikan path
// Kita import constant length untuk memastikan test akurat
import { PASSWORD_MIN_LENGTH } from '../../../../shared/validators/password.validator';

// 2. MOCK DATA
const validPassword = 'StrongPassword123!'; // Memenuhi syarat strong & min length
const validData = {
  oldPassword: 'oldPassword123',
  newPassword: validPassword,
  confirmPassword: validPassword,
};

// 3. TEST SUITE
describe('ChangePasswordDto', () => {
  // 4. SETUP AND TEARDOWN
  // DTO bersifat stateless, setup khusus tidak terlalu diperlukan
  // namun kita bisa reset variable jika dibutuhkan.

  // 5. EXECUTE METHOD TESTS (Happy Path)

  it('should validate successfully with valid data', async () => {
    const dto = plainToInstance(ChangePasswordDto, validData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  // 6. SUB-GROUP TESTS (Field Specific Validations)

  describe('oldPassword', () => {
    it('should fail if oldPassword is empty', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        oldPassword: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('oldPassword');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'Password lama harus diisi',
      );
    });

    it('should fail if oldPassword is not a string', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        oldPassword: 12345,
      });
      const errors = await validate(dto);

      expect(errors[0].property).toBe('oldPassword');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('newPassword', () => {
    it('should fail if newPassword is empty', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        newPassword: '',
      });
      const errors = await validate(dto);

      // Bisa memicu multiple error (isNotEmpty, minLength, isStrongPassword)
      // Kita cari error spesifik untuk properti ini
      const error = errors.find((e) => e.property === 'newPassword');
      expect(error).toBeDefined();
      expect(error?.constraints).toHaveProperty('isNotEmpty');
      expect(error?.constraints?.isNotEmpty).toBe('Password baru harus diisi');
    });

    it(`should fail if newPassword is shorter than ${PASSWORD_MIN_LENGTH} characters`, async () => {
      const shortPass = 'Str1!'; // Terlalu pendek
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        newPassword: shortPass,
      });
      const errors = await validate(dto);

      const error = errors.find((e) => e.property === 'newPassword');
      expect(error?.constraints).toHaveProperty('minLength');
      expect(error?.constraints?.minLength).toContain(
        `minimal ${PASSWORD_MIN_LENGTH} karakter`,
      );
    });

    it('should fail if newPassword is NOT strong (Integration Test with IsStrongPassword)', async () => {
      // Asumsi IsStrongPassword menolak password sederhana tanpa angka/simbol
      const weakPass = 'passwordbiasa';
      // Pastikan panjangnya cukup agar tidak kena error minLength
      const longWeakPass = weakPass.padEnd(PASSWORD_MIN_LENGTH + 1, 'a');

      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        newPassword: longWeakPass,
      });
      const errors = await validate(dto);

      const error = errors.find((e) => e.property === 'newPassword');
      // Nama constraint biasanya sesuai nama decorator (isStrongPassword)
      // atau custom validator name
      expect(error).toBeDefined();
      // Kita cek apakah ada error selain minLength (karena panjang sudah terpenuhi)
      expect(Object.keys(error!.constraints!)).not.toContain('minLength');
      // Biasanya custom validator muncul di sini
    });
  });

  describe('confirmPassword', () => {
    it('should fail if confirmPassword is empty', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        confirmPassword: '',
      });
      const errors = await validate(dto);

      const error = errors.find((e) => e.property === 'confirmPassword');
      expect(error?.constraints).toHaveProperty('isNotEmpty');
      expect(error?.constraints?.isNotEmpty).toBe(
        'Konfirmasi password harus diisi',
      );
    });

    it('should fail if confirmPassword does NOT match newPassword (Integration Test with Match)', async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        ...validData,
        newPassword: 'StrongPassword1!',
        confirmPassword: 'DifferentPassword1!', // Tidak sama
      });
      const errors = await validate(dto);

      const error = errors.find((e) => e.property === 'confirmPassword');
      expect(error).toBeDefined();

      // PERBAIKAN DISINI: Gunakan 'match' (huruf kecil)
      expect(error?.constraints).toHaveProperty('match');
      expect(error?.constraints?.match).toBe(
        'Konfirmasi password tidak sesuai dengan password baru',
      );
    });
  });
});
