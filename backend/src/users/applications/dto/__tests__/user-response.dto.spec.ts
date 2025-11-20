// __tests__/applications/dto/user-response.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { UserResponseDto, UserRoleDto } from '../../dto/user-response.dto';

// 2. MOCK DATA
const mockDate = new Date();
const rawUserData = {
  id: 1,
  username: 'dokter_budi',
  nama_lengkap: 'Budi Santoso',
  // Data relasi (Nested)
  roles: [
    { id: 1, name: 'DOCTOR', description: 'Dokter Umum', extraField: 'Sampah' },
    { id: 2, name: 'ADMIN', description: 'Admin Klinik' }
  ],
  created_at: mockDate.toISOString(), // String ISO
  updated_at: mockDate,             // Object Date
  profile_photo: 'avatar.jpg',
  
  // --- DATA SENSITIF (Harus Dibuang) ---
  password: 'hashed_secret_password',
  refresh_token: 'some_token',
  is_deleted: false
};

// 3. TEST SUITE
describe('UserResponseDto', () => {
  
  // 4. SETUP AND TEARDOWN
  // Stateless

  // 5. EXECUTE METHOD TESTS (Basic Serialization)

  it('should map plain object to DTO correctly', () => {
    // Act
    const dto = plainToInstance(UserResponseDto, rawUserData, {
      excludeExtraneousValues: true, // Simulasi standar NestJS Serializer
    });

    // Assert
    expect(dto).toBeInstanceOf(UserResponseDto);
    expect(dto.id).toBe(1);
    expect(dto.username).toBe('dokter_budi');
    expect(dto.nama_lengkap).toBe('Budi Santoso');
    expect(dto.profile_photo).toBe('avatar.jpg');
  });

  // 6. SUB-GROUP TESTS (Advanced Features)

  describe('Nested Transformation (Roles)', () => {
    it('should transform roles array into instances of UserRoleDto', () => {
      const dto = plainToInstance(UserResponseDto, rawUserData, {
        excludeExtraneousValues: true,
      });

      expect(dto.roles).toHaveLength(2);
      expect(dto.roles[0]).toBeInstanceOf(UserRoleDto);
      expect(dto.roles[0].name).toBe('DOCTOR');
    });

    it('should strip extraneous fields inside nested objects (roles)', () => {
      const dto = plainToInstance(UserResponseDto, rawUserData, {
        excludeExtraneousValues: true,
      });

      // Raw data punya 'extraField', di DTO harusnya hilang
      expect((dto.roles[0] as any).extraField).toBeUndefined();
    });
  });

  describe('Date Transformation', () => {
    it('should convert string dates to Date objects', () => {
      const dto = plainToInstance(UserResponseDto, rawUserData);
      
      // created_at aslinya string ISO, harus jadi Date
      expect(dto.created_at).toBeInstanceOf(Date);
      expect(dto.created_at.toISOString()).toBe(mockDate.toISOString());
    });
  });

  describe('Security (Exclusion)', () => {
    it('should EXCLUDE sensitive fields (password, tokens)', () => {
      const dto = plainToInstance(UserResponseDto, rawUserData, {
        excludeExtraneousValues: true,
      });

      // Casting ke any untuk cek properti yang seharusnya hilang
      expect((dto as any).password).toBeUndefined();
      expect((dto as any).refresh_token).toBeUndefined();
      expect((dto as any).is_deleted).toBeUndefined();
    });
  });
});