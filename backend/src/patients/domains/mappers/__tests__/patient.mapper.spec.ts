// __tests__/domains/mappers/patient.mapper.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { PatientMapper } from '../../../domains/mappers/patient.mapper';
import { Patient } from '../../../domains/entities/patient.entity';
import { PatientResponseDto } from '../../../application/dto/patient-response.dto';
import { Gender } from '../../entities/patient.entity';

// 2. MOCK DATA
const mockDate = new Date();

// Simulasi data entity lengkap dari database (termasuk field sensitif/internal)
const mockPatientEntity = {
  id: 1,
  nomor_rekam_medis: 'RM-001',
  nik: '1234567890123456',
  nama_lengkap: 'Budi Santoso',
  tanggal_lahir: new Date('1990-01-01'),
  jenis_kelamin: Gender.MALE, // Asumsi enum Gender tersedia
  email: 'budi@example.com',
  no_hp: '08123456789',
  is_active: true,
  created_at: mockDate,
  updated_at: mockDate,

  // --- FIELD SENSITIF / INTERNAL (Yang harus dibuang) ---
  password: 'supersecrethash',
  deleted_at: null,
  internal_notes: 'Pasien VIP',
  version: 1,
} as unknown as Patient; // Casting as unknown as Patient untuk simulasi field ekstra

// 3. TEST SUITE
describe('PatientMapper', () => {
  let mapper: PatientMapper;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientMapper],
    }).compile();

    mapper = module.get<PatientMapper>(PatientMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('toResponseDto', () => {
    it('should map a single Patient entity to PatientResponseDto', () => {
      // Act
      const result = mapper.toResponseDto(mockPatientEntity);

      // Assert
      expect(result).toBeInstanceOf(PatientResponseDto);
      expect(result.id).toBe(mockPatientEntity.id);
      expect(result.nama_lengkap).toBe(mockPatientEntity.nama_lengkap);
      expect(result.nomor_rekam_medis).toBe(
        mockPatientEntity.nomor_rekam_medis,
      );

      // Check Date preservation
      expect(result.created_at.getTime()).toBe(mockDate.getTime());
    });
  });

  describe('toResponseDtoList', () => {
    it('should map an array of Patient entities to array of DTOs', () => {
      // Arrange
      const patients = [
        mockPatientEntity,
        { ...mockPatientEntity, id: 2 },
      ] as any;

      // Act
      const result = mapper.toResponseDtoList(patients);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PatientResponseDto);
      expect(result[1]).toBeInstanceOf(PatientResponseDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array if input is empty', () => {
      const result = mapper.toResponseDtoList([]);
      expect(result).toEqual([]);
    });
  });

  // 6. SUB-GROUP TESTS (Security & Filtering)

  describe('Security & Exclusion Strategy', () => {
    it('should EXCLUDE sensitive fields (password, internal fields) from DTO', () => {
      // Act
      const result = mapper.toResponseDto(mockPatientEntity);

      // Assert
      // Karena excludeExtraneousValues: true, field yang tidak ada di DTO
      // atau tidak memiliki decorator @Expose akan diabaikan.

      // Kita cast ke 'any' untuk mengecek properti yang seharusnya tidak ada
      expect((result as any).password).toBeUndefined();
      expect((result as any).internal_notes).toBeUndefined();
      expect((result as any).deleted_at).toBeUndefined();
      expect((result as any).version).toBeUndefined();
    });

    it('should only include fields defined in PatientResponseDto', () => {
      // Act
      const result = mapper.toResponseDto(mockPatientEntity);
      const keys = Object.keys(result);

      // Pastikan tidak ada key 'password' di dalam object keys result
      expect(keys).not.toContain('password');
      expect(keys).toContain('nama_lengkap');
    });
  });
});
