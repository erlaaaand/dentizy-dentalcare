// __tests__/applications/dto/patient-response.dto.spec.ts

// 1. IMPORTS
import { plainToInstance } from 'class-transformer';
import { PatientResponseDto } from '../patient-response.dto';
import { Gender } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
const mockDateString = '2023-01-01T10:00:00.000Z';
const mockDateObj = new Date(mockDateString);

// Data mentah (seperti dari database) yang memiliki field ekstra (password, internal_flag)
const rawPatientData = {
  id: 1,
  nomor_rekam_medis: 'RM-001',
  nik: '1234567890123456',
  nama_lengkap: 'Budi Santoso',
  tanggal_lahir: '1990-05-15', // String, should become Date
  umur: 33,
  jenis_kelamin: Gender.MALE,
  email: 'budi@example.com',
  no_hp: '081234567890',
  alamat: 'Jl. Sudirman',
  riwayat_alergi: 'Kacang',
  riwayat_penyakit: 'Flu',
  catatan_khusus: '-',
  golongan_darah: 'O',
  pekerjaan: 'PNS',
  kontak_darurat_nama: 'Siti',
  kontak_darurat_nomor: '08987654321',
  kontak_darurat_relasi: 'Istri',
  is_registered_online: true,
  is_active: true,
  is_new_patient: false,
  created_at: mockDateString, // String ISO
  updated_at: mockDateObj, // Date object

  // Field sensitif/internal yang TIDAK boleh ada di DTO
  password: 'supersecretpassword',
  deleted_at: null,
  internal_version: 1,
};

// 3. TEST SUITE
describe('PatientResponseDto', () => {
  // 4. SETUP AND TEARDOWN
  // DTO bersifat stateless, tidak butuh setup kompleks.
  beforeEach(() => {
    // Reset state jika diperlukan
  });

  // 5. EXECUTE METHOD TESTS (General Mapping)

  it('should map plain object to DTO instance correctly', () => {
    // Act
    const dto = plainToInstance(PatientResponseDto, rawPatientData);

    // Assert (Basic Fields)
    expect(dto).toBeInstanceOf(PatientResponseDto);
    expect(dto.id).toBe(1);
    expect(dto.nama_lengkap).toBe('Budi Santoso');
    expect(dto.nomor_rekam_medis).toBe('RM-001');
    expect(dto.is_registered_online).toBe(true);
    expect(dto.kontak_darurat_nama).toBe('Siti');
  });

  // 6. SUB-GROUP TESTS (Specific Features)

  describe('Date Transformation (@Type)', () => {
    it('should transform string date fields into Date objects', () => {
      const dto = plainToInstance(PatientResponseDto, rawPatientData);

      // Test tanggal_lahir (input string 'YYYY-MM-DD' di mock)
      expect(dto.tanggal_lahir).toBeInstanceOf(Date);
      // Validasi parsing tahun benar
      expect(dto.tanggal_lahir.getFullYear()).toBe(1990);
    });

    it('should transform ISO string timestamps into Date objects', () => {
      const dto = plainToInstance(PatientResponseDto, rawPatientData);

      // Test created_at (input ISO string)
      expect(dto.created_at).toBeInstanceOf(Date);
      expect(dto.created_at.toISOString()).toBe(mockDateString);
    });

    it('should handle existing Date objects correctly', () => {
      const dto = plainToInstance(PatientResponseDto, rawPatientData);

      // Test updated_at (input sudah Date object)
      expect(dto.updated_at).toBeInstanceOf(Date);
      expect(dto.updated_at).toEqual(mockDateObj);
    });
  });

  describe('Exclusion Strategy (@Expose)', () => {
    it('should exclude properties not marked with @Expose when strategy is applied', () => {
      // Act
      // PENTING: excludeExtraneousValues: true adalah opsi standar saat menggunakan DTO Response
      // untuk mencegah kebocoran data (mass assignment vulnerability).
      const dto = plainToInstance(PatientResponseDto, rawPatientData, {
        excludeExtraneousValues: true,
      });

      // Assert
      // 1. Pastikan field yang di-expose ADA
      expect(dto.nama_lengkap).toBeDefined();

      // 2. Pastikan field rahasia TIDAK ADA (undefined)
      expect((dto as any).password).toBeUndefined();
      expect((dto as any).internal_version).toBeUndefined();
      expect((dto as any).deleted_at).toBeUndefined();
    });

    it('should keep fields even if values are null/undefined', () => {
      const incompleteData = { ...rawPatientData, riwayat_alergi: null };
      const dto = plainToInstance(PatientResponseDto, incompleteData, {
        excludeExtraneousValues: true,
      });

      // Expose tetap bekerja meskipun nilainya null, kuncinya adalah property-nya ada di source
      // atau class-transformer setting
      expect(dto.riwayat_alergi).toBeNull();
    });
  });

  describe('Data Types & Enum', () => {
    it('should preserve Enum types correctly', () => {
      const dto = plainToInstance(PatientResponseDto, rawPatientData);
      expect(dto.jenis_kelamin).toBe(Gender.MALE);
    });

    it('should preserve Boolean types correctly', () => {
      const dto = plainToInstance(PatientResponseDto, rawPatientData);
      expect(typeof dto.is_active).toBe('boolean');
      expect(dto.is_active).toBe(true);
    });
  });
});
