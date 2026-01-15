// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { PatientValidator } from '../../../domains/validators/patient.validator';
import { PatientCreateValidator } from '../../../domains/validators/patient-create.validator';
import { PatientUpdateValidator } from '../../../domains/validators/patient-update.validator';
import { PatientSearchValidator } from '../../../domains/validators/patient-search.validator';

import { CreatePatientDto } from '../../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../../application/dto/update-patient.dto';
import { SearchPatientDto } from '../../../application/dto/search-patient.dto';

// 2. MOCK DATA
const mockCreateDto: CreatePatientDto = {
  nama_lengkap: 'Budi Create',
  nik: '1234567890123456',
  email: 'create@test.com',
  no_hp: '0811',
} as CreatePatientDto;

const mockUpdateDto: UpdatePatientDto = {
  nama_lengkap: 'Budi Update',
};

const mockSearchQuery: SearchPatientDto = {
  search: 'Budi',
  page: 1,
};

// 3. TEST SUITE
describe('PatientValidator (Facade)', () => {
  let validator: PatientValidator;
  let createValidator: any;
  let updateValidator: any;
  let searchValidator: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Sub-Validators
    createValidator = {
      validate: jest.fn(),
    };

    updateValidator = {
      validate: jest.fn(),
    };

    searchValidator = {
      validate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientValidator,
        { provide: PatientCreateValidator, useValue: createValidator },
        { provide: PatientUpdateValidator, useValue: updateValidator },
        { provide: PatientSearchValidator, useValue: searchValidator },
      ],
    }).compile();

    validator = module.get<PatientValidator>(PatientValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('validateCreate', () => {
    it('should delegate to PatientCreateValidator with correct arguments', async () => {
      // Act
      await validator.validateCreate(mockCreateDto);

      // Assert
      expect(createValidator.validate).toHaveBeenCalledTimes(1);
      expect(createValidator.validate).toHaveBeenCalledWith(mockCreateDto);
    });
  });

  describe('validateUpdate', () => {
    it('should delegate to PatientUpdateValidator with correct arguments', async () => {
      // Act
      const id = 1;
      await validator.validateUpdate(id, mockUpdateDto);

      // Assert
      expect(updateValidator.validate).toHaveBeenCalledTimes(1);
      expect(updateValidator.validate).toHaveBeenCalledWith(id, mockUpdateDto);
    });
  });

  describe('validateSearchQuery', () => {
    it('should delegate to PatientSearchValidator with correct arguments', () => {
      // Act
      validator.validateSearchQuery(mockSearchQuery);

      // Assert
      expect(searchValidator.validate).toHaveBeenCalledTimes(1);
      expect(searchValidator.validate).toHaveBeenCalledWith(mockSearchQuery);
    });
  });

  // 6. SUB-GROUP TESTS (Error Propagation)

  describe('Error Propagation', () => {
    it('should propagate errors thrown by createValidator', async () => {
      // Arrange
      const error = new BadRequestException('Create Validation Failed');
      createValidator.validate.mockRejectedValue(error);

      // Act & Assert
      await expect(validator.validateCreate(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(validator.validateCreate(mockCreateDto)).rejects.toThrow(
        'Create Validation Failed',
      );
    });

    it('should propagate errors thrown by updateValidator', async () => {
      // Arrange
      const error = new BadRequestException('Update Validation Failed');
      updateValidator.validate.mockRejectedValue(error);

      // Act & Assert
      await expect(validator.validateUpdate(1, mockUpdateDto)).rejects.toThrow(
        error,
      );
    });

    it('should propagate errors thrown by searchValidator', () => {
      // Arrange
      const error = new BadRequestException('Search Validation Failed');
      // Note: searchValidator is usually synchronous in your code, so use mockImplementation throwing
      searchValidator.validate.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => validator.validateSearchQuery(mockSearchQuery)).toThrow(
        BadRequestException,
      );
      expect(() => validator.validateSearchQuery(mockSearchQuery)).toThrow(
        'Search Validation Failed',
      );
    });
  });
});
