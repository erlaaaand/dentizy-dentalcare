// __tests__/domains/validators/patient-update.validator.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { PatientUpdateValidator } from '../../../domains/validators/patient-update.validator';
import { PatientFieldValidator } from '../../../domains/validators/patient-field.validator';
import { Patient } from '../../../domains/entities/patient.entity';
import { UpdatePatientDto } from '../../../application/dto/update-patient.dto';

// 2. MOCK DATA
const mockPatientId = 1;
const mockExistingPatient = {
  id: mockPatientId,
  nama_lengkap: 'Budi Lama',
  nik: '1111',
  email: 'budi@test.com',
  no_hp: '0811',
} as Patient;

const mockOtherPatient = {
  id: 99, // ID berbeda
  nik: '2222',
  email: 'other@test.com',
} as Patient;

const validUpdateDto: UpdatePatientDto = {
  nama_lengkap: 'Budi Baru',
  nik: '1111', // Sama dengan lama (tidak berubah)
  email: 'budi.new@test.com', // Berubah
};

// 3. TEST SUITE
describe('PatientUpdateValidator', () => {
  let validator: PatientUpdateValidator;
  let repository: Repository<Patient>;
  let fieldValidator: PatientFieldValidator;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Repository
    const mockRepository = {
      findOneBy: jest.fn(), // Untuk mencari pasien yg mau diupdate
      findOne: jest.fn(), // Untuk cek duplikat NIK/Email
    };

    // Mock Field Validator
    const mockFieldValidator = {
      validateBirthDate: jest.fn(),
      validatePhoneNumber: jest.fn(),
      validateEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientUpdateValidator,
        { provide: getRepositoryToken(Patient), useValue: mockRepository },
        { provide: PatientFieldValidator, useValue: mockFieldValidator },
      ],
    }).compile();

    validator = module.get<PatientUpdateValidator>(PatientUpdateValidator);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    fieldValidator = module.get<PatientFieldValidator>(PatientFieldValidator);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Happy Path)

  describe('validate', () => {
    it('should pass validation for valid update request', async () => {
      // Arrange
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );
      (repository.findOne as jest.Mock).mockResolvedValue(null); // Tidak ada duplikat email baru

      // Act
      await validator.validate(mockPatientId, validUpdateDto);

      // Assert
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockPatientId });

      // Verifikasi Field Validator dipanggil
      expect(fieldValidator.validateEmail).toHaveBeenCalledWith(
        validUpdateDto.email,
      );
    });
  });

  // 6. SUB-GROUP TESTS (Logic Branches)

  describe('Existence Check', () => {
    it('should throw BadRequestException if patient does not exist', async () => {
      // Arrange
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(validator.validate(999, validUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(validator.validate(999, validUpdateDto)).rejects.toThrow(
        /tidak ditemukan/,
      );
    });
  });

  describe('Uniqueness Checks (NIK & Email)', () => {
    it('should SKIP uniqueness check if NIK/Email is unchanged', async () => {
      // Arrange
      const unchangedDto: UpdatePatientDto = {
        nik: '1111',
        email: 'budi@test.com',
      };
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );

      // Act
      await validator.validate(mockPatientId, unchangedDto);

      // Assert
      // findOne (untuk cek duplikat) TIDAK boleh dipanggil karena data sama dengan mockExistingPatient
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new NIK is taken by another patient', async () => {
      // Arrange
      const dto: UpdatePatientDto = { nik: '2222' }; // NIK baru
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );

      // Mock findOne menemukan user LAIN (mockOtherPatient id: 99)
      (repository.findOne as jest.Mock).mockResolvedValue(mockOtherPatient);

      // Act & Assert
      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        /NIK .* sudah terdaftar/,
      );
    });

    it('should throw ConflictException if new Email is taken by another patient', async () => {
      // Arrange
      const dto: UpdatePatientDto = { email: 'other@test.com' };
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );
      (repository.findOne as jest.Mock).mockResolvedValue(mockOtherPatient);

      // Act & Assert
      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should ALLOW if NIK/Email found belongs to SAME patient (edge case)', async () => {
      // Skenario: NIK diubah, tapi ternyata "duplikat" yg ditemukan adalah dirinya sendiri
      // (Mungkin jarang terjadi via API update, tapi safeguard logic di kode menangani ini)
      const dto: UpdatePatientDto = { email: 'budi@test.com' }; // Anggap berubah logic-nya
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );

      // findOne menemukan existing patient (ID sama)
      (repository.findOne as jest.Mock).mockResolvedValue(mockExistingPatient);

      // Act
      await expect(
        validator.validate(mockPatientId, dto),
      ).resolves.not.toThrow();
    });
  });

  describe('Contact Update Logic (Business Rule)', () => {
    // Pasien awal: Ada HP, Ada Email

    it('should ALLOW removing Email if Phone remains', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      ); // Punya HP & Email
      const dto: UpdatePatientDto = { email: null as any }; // Hapus email

      await expect(
        validator.validate(mockPatientId, dto),
      ).resolves.not.toThrow();
    });

    it('should ALLOW removing Phone if Email remains', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );
      const dto: UpdatePatientDto = { no_hp: null as any }; // Hapus HP

      await expect(
        validator.validate(mockPatientId, dto),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException if trying to remove BOTH', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(
        mockExistingPatient,
      );
      const dto: UpdatePatientDto = { email: null as any, no_hp: null as any };

      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        /harus memiliki minimal satu kontak/,
      );
    });

    it('should throw BadRequestException if removing the ONLY remaining contact', async () => {
      // Arrange: Pasien cuma punya HP, Email null
      const phoneOnlyPatient = { ...mockExistingPatient, email: null };
      (repository.findOneBy as jest.Mock).mockResolvedValue(phoneOnlyPatient);

      // Act: User mencoba menghapus HP
      const dto: UpdatePatientDto = { no_hp: null as any };

      // Assert: Error karena sisa Email (null) dan HP (baru dihapus) -> kosong
      await expect(validator.validate(mockPatientId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
