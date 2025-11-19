// __tests__/domains/validators/patient-create.validator.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { PatientCreateValidator } from '../../../domains/validators/patient-create.validator';
import { PatientFieldValidator } from '../../../domains/validators/patient-field.validator';
import { Patient } from '../../../domains/entities/patient.entity';
import { CreatePatientDto } from '../../../application/dto/create-patient.dto';

// 2. MOCK DATA
const validDto: CreatePatientDto = {
  nama_lengkap: 'Budi Valid',
  nik: '1234567890123456',
  email: 'budi@test.com',
  no_hp: '08123456789',
  tanggal_lahir: '1990-01-01',
  alamat: 'Jl. Test',
};

const existingPatient = {
  id: 1,
  nama_lengkap: 'Existing Budi',
  nik: '1234567890123456',
  email: 'budi@test.com',
} as Patient;

// 3. TEST SUITE
describe('PatientCreateValidator', () => {
  let validator: PatientCreateValidator;
  let repository: Repository<Patient>;
  let fieldValidator: PatientFieldValidator;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Repository
    const mockRepository = {
      findOne: jest.fn(),
    };

    // Mock Field Validator (Delegated service)
    const mockFieldValidator = {
      validateBirthDate: jest.fn(),
      validatePhoneNumber: jest.fn(),
      validateEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientCreateValidator,
        { provide: getRepositoryToken(Patient), useValue: mockRepository },
        { provide: PatientFieldValidator, useValue: mockFieldValidator },
      ],
    }).compile();

    validator = module.get<PatientCreateValidator>(PatientCreateValidator);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    fieldValidator = module.get<PatientFieldValidator>(PatientFieldValidator);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Happy Path)

  describe('validate', () => {
    it('should pass validation for a perfectly valid DTO', async () => {
      // Arrange
      // Repository returns null (meaning no duplicates found)
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await validator.validate(validDto);

      // Assert
      // 1. Check Unique Fields Check
      expect(repository.findOne).toHaveBeenCalledTimes(2); // NIK check + Email check

      // 2. Check Field Format Delegation
      expect(fieldValidator.validateBirthDate).toHaveBeenCalledWith(validDto.tanggal_lahir);
      expect(fieldValidator.validatePhoneNumber).toHaveBeenCalledWith(validDto.no_hp);
      expect(fieldValidator.validateEmail).toHaveBeenCalledWith(validDto.email);
    });
  });

  // 6. SUB-GROUP TESTS (Validation Rules)

  describe('Unique Constraints (NIK & Email)', () => {
    it('should throw ConflictException if NIK already exists', async () => {
      // Arrange
      // Simulasi findOne pertama (NIK check) menemukan user
      (repository.findOne as jest.Mock).mockResolvedValueOnce(existingPatient);

      // Act & Assert
      const promise = validator.validate(validDto);

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow(/NIK .* sudah terdaftar/);
    });

    it('should throw ConflictException if Email already exists', async () => {
      // Arrange
      // NIK check -> null (aman)
      (repository.findOne as jest.Mock).mockResolvedValueOnce(null);
      // Email check -> exists (conflict)
      (repository.findOne as jest.Mock).mockResolvedValueOnce(existingPatient);


      const promise = validator.validate(validDto);

      // Act & Assert
      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow(/email .* sudah terdaftar/);
    });
  });

  describe('Contact Information Rules', () => {
    it('should throw BadRequestException if BOTH phone and email are missing', async () => {
      // Arrange
      const noContactDto: CreatePatientDto = {
        ...validDto,
        email: undefined,
        no_hp: undefined, // or null/empty string depending on DTO transform
      };
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(validator.validate(noContactDto)).rejects.toThrow(BadRequestException);
      await expect(validator.validate(noContactDto)).rejects.toThrow(/harus memiliki minimal satu kontak/);
    });

    it('should pass if ONLY Phone Number is provided', async () => {
      // Arrange
      const phoneOnlyDto: CreatePatientDto = { ...validDto, email: undefined };
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await validator.validate(phoneOnlyDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledTimes(1); // Only NIK check runs, Email check skipped if undefined
    });

    it('should pass if ONLY Email is provided', async () => {
      // Arrange
      const emailOnlyDto: CreatePatientDto = { ...validDto, no_hp: undefined };
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      await validator.validate(emailOnlyDto);

      // Assert
      // Check logic should proceed
      expect(fieldValidator.validateEmail).toHaveBeenCalledWith(emailOnlyDto.email);
    });
  });

  describe('Field Validation Delegation', () => {
    it('should propagate errors thrown by FieldValidator', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Simulasi Field Validator melempar error format (misal tanggal salah)
      const formatError = new BadRequestException('Format tanggal salah');
      (fieldValidator.validateBirthDate as jest.Mock).mockImplementation(() => {
        throw formatError;
      });

      // Act & Assert
      await expect(validator.validate(validDto)).rejects.toThrow(BadRequestException);
      await expect(validator.validate(validDto)).rejects.toThrow('Format tanggal salah');
    });
  });
});