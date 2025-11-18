import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MedicalRecordCreateValidator } from '../medical-record-create.validator';
import { CreateMedicalRecordDto } from '../../../applications/dto/create-medical-record.dto';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('MedicalRecordCreateValidator', () => {
  let validator: MedicalRecordCreateValidator;

  // ==================== MOCK DATA ====================
  const mockUser: User = {
    id: 1,
    nama_lengkap: 'Dr. Test',
    roles: [{ id: 1, name: UserRole.DOKTER }],
  } as User;

  const mockAppointment: Appointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    tanggal_janji: new Date('2025-01-15'),
    status: AppointmentStatus.SELESAI,
  } as Appointment;

  const validDto: CreateMedicalRecordDto = {
    appointment_id: 1,
    user_id_staff: 1,
    subjektif: 'Pasien mengeluh demam',
    objektif: 'Suhu: 38.5°C',
    assessment: 'Demam dengan ISPA',
    plan: 'Paracetamol 3x500mg',
  };

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordCreateValidator],
    }).compile();

    validator = module.get<MedicalRecordCreateValidator>(MedicalRecordCreateValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATE METHOD TESTS ====================
  describe('validate', () => {
    it('should validate successfully with complete data', () => {
      expect(() => {
        validator.validate(validDto, mockAppointment, mockUser);
      }).not.toThrow();
    });

    it('should throw when dto is null', () => {
      expect(() => {
        validator.validate(null, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when appointment is null', () => {
      expect(() => {
        validator.validate(validDto, null, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should validate all components', () => {
      const validateDtoSpy = jest.spyOn(validator as any, 'validateDto');
      const validateAppointmentSpy = jest.spyOn(validator as any, 'validateAppointment');
      const validateSOAPSpy = jest.spyOn(validator as any, 'validateSOAPFields');
      const validateBusinessSpy = jest.spyOn(validator as any, 'validateBusinessRules');

      validator.validate(validDto, mockAppointment, mockUser);

      expect(validateDtoSpy).toHaveBeenCalled();
      expect(validateAppointmentSpy).toHaveBeenCalled();
      expect(validateSOAPSpy).toHaveBeenCalled();
      expect(validateBusinessSpy).toHaveBeenCalled();
    });
  });

  // ==================== VALIDATE DTO TESTS ====================
  describe('validateDto', () => {
    it('should throw when appointment_id is missing', () => {
      const invalidDto: Partial<CreateMedicalRecordDto> = { ...validDto };
      delete invalidDto.appointment_id;

      expect(() => {
        validator.validate(invalidDto as CreateMedicalRecordDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);

    });

    it('should throw when appointment_id is zero or negative', () => {
      const invalidDto = { ...validDto, appointment_id: 0 };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when user_id_staff is missing', () => {
      const invalidDto: Partial<CreateMedicalRecordDto> = { ...validDto };
      delete invalidDto.user_id_staff;

      expect(() => {
        validator.validate(invalidDto as CreateMedicalRecordDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when user_id_staff is zero or negative', () => {
      const invalidDto = { ...validDto, user_id_staff: -1 };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });
  });

  // ==================== VALIDATE APPOINTMENT TESTS ====================
  describe('validateAppointment', () => {
    it('should throw when appointment status is DIBATALKAN', () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.DIBATALKAN,
      };

      expect(() => {
        validator.validate(validDto, cancelledAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when appointment has no patient', () => {
      const invalidAppointment = {
        ...mockAppointment,
        patient_id: null,
      } as unknown as Appointment; // ← perbaikan penting

      expect(() => {
        validator.validate(validDto, invalidAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when appointment has no doctor', () => {
      const invalidAppointment = {
        ...mockAppointment,
        doctor_id: null,
      } as unknown as Appointment;

      expect(() => {
        validator.validate(validDto, invalidAppointment, mockUser);
      }).toThrow(BadRequestException);
    });
  });

  // ==================== VALIDATE SOAP FIELDS TESTS ====================
  describe('validateSOAPFields', () => {
    it('should throw when all SOAP fields are empty', () => {
      const invalidDto: CreateMedicalRecordDto = {
        appointment_id: 1,
        user_id_staff: 1,
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should pass with only one SOAP field', () => {
      const minimalDto: CreateMedicalRecordDto = {
        appointment_id: 1,
        user_id_staff: 1,
        subjektif: 'Test subjektif',
      };

      expect(() => {
        validator.validate(minimalDto, mockAppointment, mockUser);
      }).not.toThrow();
    });

    it('should throw when field exceeds max length', () => {
      const invalidDto = {
        ...validDto,
        subjektif: 'a'.repeat(5001),
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when field is less than 3 characters', () => {
      const invalidDto = {
        ...validDto,
        subjektif: 'ab',
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when field is only whitespace', () => {
      const invalidDto = {
        ...validDto,
        subjektif: '   ',
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when field is only punctuation', () => {
      const invalidDto = {
        ...validDto,
        subjektif: '....',
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when field is only numbers', () => {
      const invalidDto = {
        ...validDto,
        subjektif: '12345',
      };

      expect(() => {
        validator.validate(invalidDto, mockAppointment, mockUser);
      }).toThrow(BadRequestException);
    });
  });

  // ==================== VALIDATE BUSINESS RULES TESTS ====================
  describe('validateBusinessRules', () => {
    it('should throw when appointment date is in the future', () => {
      const futureAppointment = {
        ...mockAppointment,
        tanggal_janji: new Date(Date.now() + 86400000), // tomorrow
      };

      expect(() => {
        validator.validate(validDto, futureAppointment, mockUser);
      }).toThrow(BadRequestException);
    });

    it('should throw when appointment is too old', () => {
      const today = new Date();
      const oldAppointmentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 366
      );

      const oldAppointment = {
        ...mockAppointment,
        tanggal_janji: oldAppointmentDate,
      };

      expect(() => validator.validate(validDto, oldAppointment, mockUser))
        .toThrow(BadRequestException);
    });

    it('should pass for appointment within valid date range', () => {
      const recentAppointment = {
        ...mockAppointment,
        tanggal_janji: new Date(Date.now() - 7 * 86400000), // 7 days ago
      };

      expect(() => {
        validator.validate(validDto, recentAppointment, mockUser);
      }).not.toThrow();
    });
  });

  // ==================== SOAP COMPLETENESS TESTS ====================
  describe('validateSOAPCompleteness', () => {
    it('should return true when all SOAP fields are filled', () => {
      const result = validator.validateSOAPCompleteness(validDto);
      expect(result).toBe(true);
    });

    it('should return false when subjektif is missing', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.subjektif;
      const result = validator.validateSOAPCompleteness(incompleteDto);
      expect(result).toBe(false);
    });

    it('should return false when objektif is missing', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.objektif;
      const result = validator.validateSOAPCompleteness(incompleteDto);
      expect(result).toBe(false);
    });

    it('should return false when assessment is missing', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.assessment;
      const result = validator.validateSOAPCompleteness(incompleteDto);
      expect(result).toBe(false);
    });

    it('should return false when plan is missing', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.plan;
      const result = validator.validateSOAPCompleteness(incompleteDto);
      expect(result).toBe(false);
    });
  });

  // ==================== GET VALIDATION WARNINGS TESTS ====================
  describe('getValidationWarnings', () => {
    it('should return empty array for complete SOAP', () => {
      const warnings = validator.getValidationWarnings(validDto);
      expect(warnings).toEqual([]);
    });

    it('should return warnings for missing subjektif', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.subjektif;
      const warnings = validator.getValidationWarnings(incompleteDto);
      expect(warnings).toContain('Field Subjektif kosong');
    });

    it('should return warnings for missing objektif', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.objektif;
      const warnings = validator.getValidationWarnings(incompleteDto);
      expect(warnings).toContain('Field Objektif kosong');
    });

    it('should return warnings for missing assessment', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.assessment;
      const warnings = validator.getValidationWarnings(incompleteDto);
      expect(warnings).toContain('Field Assessment kosong');
    });

    it('should return warnings for missing plan', () => {
      const incompleteDto = { ...validDto };
      delete incompleteDto.plan;
      const warnings = validator.getValidationWarnings(incompleteDto);
      expect(warnings).toContain('Field Plan kosong');
    });

    it('should return multiple warnings for multiple missing fields', () => {
      const incompleteDto: CreateMedicalRecordDto = {
        appointment_id: 1,
        user_id_staff: 1,
      };
      const warnings = validator.getValidationWarnings(incompleteDto);
      expect(warnings.length).toBe(4);
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle empty string fields', () => {
      const dtoWithEmpty = {
        ...validDto,
        subjektif: '',
      };

      expect(() => {
        validator.validate(dtoWithEmpty, mockAppointment, mockUser);
      }).not.toThrow();
    });

    it('should handle whitespace trimming', () => {
      const dtoWithWhitespace = {
        ...validDto,
        subjektif: '  Valid subjektif  ',
      };

      expect(() => {
        validator.validate(dtoWithWhitespace, mockAppointment, mockUser);
      }).not.toThrow();
    });

    it('should handle exact max length', () => {
      const dtoMaxLength = {
        ...validDto,
        subjektif: 'a'.repeat(5000),
      };

      expect(() => {
        validator.validate(dtoMaxLength, mockAppointment, mockUser);
      }).not.toThrow();
    });

    it('should handle exact min length', () => {
      const dtoMinLength = {
        ...validDto,
        subjektif: 'abc',
      };

      expect(() => {
        validator.validate(dtoMinLength, mockAppointment, mockUser);
      }).not.toThrow();
    });
  });
});