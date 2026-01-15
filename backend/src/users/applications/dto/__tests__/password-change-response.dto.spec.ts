// __tests__/applications/dto/password-change-response.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { PasswordChangeResponseDto } from '../../dto/password-change-response.dto';

// 2. MOCK DATA
const mockDate = new Date().toISOString();

const rawResponseData = {
  message: 'Sukses ganti password',
  timestamp: mockDate,
  user: {
    id: 10,
    username: 'dokter_budi',
    // Field sensitif/sampah yang harus dibuang oleh DTO
    password: 'hashed_secret',
    role: 'admin',
  },
  // Field sampah di root level
  internalCode: 200,
};

// 3. TEST SUITE
describe('PasswordChangeResponseDto', () => {
  // 4. SETUP AND TEARDOWN
  // Stateless

  // 5. EXECUTE METHOD TESTS (Serialization)

  it('should map plain object to DTO correctly', () => {
    // Act
    // excludeExtraneousValues: true adalah setting standar di NestJS SerializerInterceptor
    const dto = plainToInstance(PasswordChangeResponseDto, rawResponseData, {
      excludeExtraneousValues: true,
    });

    // Assert
    expect(dto).toBeInstanceOf(PasswordChangeResponseDto);
    expect(dto.message).toBe(rawResponseData.message);
    expect(dto.timestamp).toBe(mockDate);
    expect(dto.user).toBeDefined();
    expect(dto.user?.id).toBe(10);
    expect(dto.user?.username).toBe('dokter_budi');
  });

  // 6. SUB-GROUP TESTS (Security & Optionality)

  describe('Security (Data Stripping)', () => {
    it('should STRIP extraneous fields (password, internal codes)', () => {
      const dto = plainToInstance(PasswordChangeResponseDto, rawResponseData, {
        excludeExtraneousValues: true,
      });

      // Pastikan field rahasia tidak ikut terbawa
      // Kita casting ke 'any' untuk mengecek properti yang seharusnya hilang
      expect((dto as any).internalCode).toBeUndefined();
      expect((dto.user as any).password).toBeUndefined();
      expect((dto.user as any).role).toBeUndefined();
    });
  });

  describe('Optional User Field', () => {
    it('should handle response without user object', () => {
      const dataWithoutUser = {
        message: 'Reset success',
        timestamp: mockDate,
      };

      const dto = plainToInstance(PasswordChangeResponseDto, dataWithoutUser, {
        excludeExtraneousValues: true,
      });

      expect(dto.message).toBe('Reset success');
      expect(dto.user).toBeUndefined();
    });
  });
});
