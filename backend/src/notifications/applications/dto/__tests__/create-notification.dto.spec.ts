// 1. IMPORTS
import { validate } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { CreateNotificationDto } from '../create-notification.dto';
import { NotificationType } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockValidData = {
  appointment_id: 1,
  type: NotificationType.EMAIL_REMINDER,
  send_at: new Date('2024-01-15T10:00:00.000Z')
};

const mockInvalidData = {
  appointment_id: 'invalid', // should be number
  type: 'INVALID_TYPE', // should be valid enum
  send_at: 'invalid-date' // should be valid Date
};

const mockPartialData = {
  appointment_id: 1
  // missing required fields: type, send_at
};

const mockEdgeCases = {
  appointment_id: 0, // edge case: zero
  type: NotificationType.EMAIL_REMINDER,
  send_at: new Date('2023-12-31T23:59:59.999Z') // edge case: end of year
};

// 3. TEST SUITE
describe('CreateNotificationDto', () => {

  // 4. SETUP AND TEARDOWN
  let validationErrors: any[];

  beforeEach(() => {
    validationErrors = [];
  });

  afterEach(() => {
    validationErrors = [];
  });

  // 5. EXECUTE METHOD TESTS
  describe('Validation Method Tests', () => {

    const executeValidation = async (data: any): Promise<any[]> => {
      const dtoObject = plainToClass(CreateNotificationDto, data);
      return await validate(dtoObject);
    };

    it('should execute validation without errors for valid data', async () => {
      const errors = await executeValidation(mockValidData);
      expect(errors).toHaveLength(0);
    });

    it('should execute validation with errors for invalid data', async () => {
      const errors = await executeValidation(mockInvalidData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should transform and validate date correctly', async () => {
      const dataWithStringDate = {
        appointment_id: 1,
        type: NotificationType.EMAIL_REMINDER,
        send_at: '2024-01-15T10:00:00.000Z'
      };

      const errors = await executeValidation(dataWithStringDate);
      expect(errors).toHaveLength(0);
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Field Validation Tests', () => {

    describe('appointment_id field', () => {
      it('should validate correct appointment_id', async () => {
        const dto = plainToClass(CreateNotificationDto, mockValidData);
        const errors = await validate(dto);
        const appointmentIdErrors = errors.filter(error => error.property === 'appointment_id');
        expect(appointmentIdErrors).toHaveLength(0);
      });

      it('should reject non-number appointment_id', async () => {
        const invalidData = { ...mockValidData, appointment_id: 'not-a-number' };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const appointmentIdErrors = errors.filter(error => error.property === 'appointment_id');
        expect(appointmentIdErrors).toHaveLength(1);
        expect(appointmentIdErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject empty appointment_id', async () => {
        const invalidData = { ...mockValidData, appointment_id: undefined };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const appointmentIdErrors = errors.filter(error => error.property === 'appointment_id');
        expect(appointmentIdErrors).toHaveLength(1);
        expect(appointmentIdErrors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should accept zero as valid appointment_id', async () => {
        const dataWithZero = { ...mockValidData, appointment_id: 0 };
        const dto = plainToClass(CreateNotificationDto, dataWithZero);
        const errors = await validate(dto);
        const appointmentIdErrors = errors.filter(error => error.property === 'appointment_id');
        expect(appointmentIdErrors).toHaveLength(0);
      });

      it('should accept negative appointment_id', async () => {
        const dataWithNegative = { ...mockValidData, appointment_id: -1 };
        const dto = plainToClass(CreateNotificationDto, dataWithNegative);
        const errors = await validate(dto);
        const appointmentIdErrors = errors.filter(error => error.property === 'appointment_id');
        expect(appointmentIdErrors).toHaveLength(0);
      });
    });

    describe('type field', () => {
      it('should validate correct NotificationType', async () => {
        const dto = plainToClass(CreateNotificationDto, mockValidData);
        const errors = await validate(dto);
        const typeErrors = errors.filter(error => error.property === 'type');
        expect(typeErrors).toHaveLength(0);
      });

      it('should reject invalid NotificationType', async () => {
        const invalidData = { ...mockValidData, type: 'INVALID_TYPE' };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const typeErrors = errors.filter(error => error.property === 'type');
        expect(typeErrors).toHaveLength(1);
        expect(typeErrors[0].constraints).toHaveProperty('isEnum');
      });

      it('should reject empty type', async () => {
        const invalidData = { ...mockValidData, type: undefined };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const typeErrors = errors.filter(error => error.property === 'type');
        expect(typeErrors).toHaveLength(1);
        expect(typeErrors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should accept all valid NotificationType values', async () => {
        const validTypes = Object.values(NotificationType);

        for (const type of validTypes) {
          const data = { ...mockValidData, type };
          const dto = plainToClass(CreateNotificationDto, data);
          const errors = await validate(dto);
          const typeErrors = errors.filter(error => error.property === 'type');
          expect(typeErrors).toHaveLength(0);
        }
      });
    });

    describe('send_at field', () => {
      it('should validate correct Date object', async () => {
        const dto = plainToClass(CreateNotificationDto, mockValidData);
        const errors = await validate(dto);
        const sendAtErrors = errors.filter(error => error.property === 'send_at');
        expect(sendAtErrors).toHaveLength(0);
      });

      it('should transform string to Date and validate', async () => {
        const dataWithStringDate = {
          ...mockValidData,
          send_at: '2024-01-15T10:00:00.000Z'
        };
        const dto = plainToClass(CreateNotificationDto, dataWithStringDate);
        const errors = await validate(dto);
        const sendAtErrors = errors.filter(error => error.property === 'send_at');
        expect(sendAtErrors).toHaveLength(0);
        expect(dto.send_at).toBeInstanceOf(Date);
      });

      it('should reject invalid date string', async () => {
        const invalidData = { ...mockValidData, send_at: 'not-a-date' };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const sendAtErrors = errors.filter(error => error.property === 'send_at');
        expect(sendAtErrors).toHaveLength(1);
        expect(sendAtErrors[0].constraints).toHaveProperty('isDate');
      });

      it('should reject empty send_at', async () => {
        const invalidData = { ...mockValidData, send_at: undefined };
        const dto = plainToClass(CreateNotificationDto, invalidData);
        const errors = await validate(dto);
        const sendAtErrors = errors.filter(error => error.property === 'send_at');
        expect(sendAtErrors).toHaveLength(1);
        expect(sendAtErrors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should reject non-date values', async () => {
        const invalidData = { ...mockValidData, send_at: 12345 };

        const dto = plainToInstance(CreateNotificationDto, invalidData);
        const errors = await validate(dto);

        const sendAtErrors = errors.filter(error => error.property === 'send_at');

        expect(sendAtErrors).toHaveLength(1);
        expect(sendAtErrors[0].constraints).toHaveProperty('isDate');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete valid object', async () => {
      const dto = plainToClass(CreateNotificationDto, mockValidData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject object with all invalid fields', async () => {
      const dto = plainToClass(CreateNotificationDto, mockInvalidData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(3); // all three fields should have errors
    });

    it('should reject object with missing required fields', async () => {
      const dto = plainToClass(CreateNotificationDto, mockPartialData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(2); // type and send_at are missing
    });

    it('should validate edge case values correctly', async () => {
      const dto = plainToClass(CreateNotificationDto, mockEdgeCases);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should transform and validate ISO date string', async () => {
      const isoDateData = {
        appointment_id: 1,
        type: NotificationType.EMAIL_REMINDER,
        send_at: '2024-01-15T10:00:00.000Z'
      };

      const dto = plainToClass(CreateNotificationDto, isoDateData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.send_at).toBeInstanceOf(Date);
      expect(dto.send_at.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  describe('Error Message Tests', () => {
    it('should provide appropriate error messages for invalid appointment_id', async () => {
      const invalidData = { ...mockValidData, appointment_id: 'invalid' };
      const dto = plainToClass(CreateNotificationDto, invalidData);
      const errors = await validate(dto);
      const appointmentIdError = errors.find(error => error.property === 'appointment_id');

      expect(appointmentIdError).toBeDefined();
      expect(appointmentIdError!.constraints).toHaveProperty('isNumber');
    });

    it('should provide appropriate error messages for invalid type', async () => {
      const invalidData = { ...mockValidData, type: 'INVALID' };
      const dto = plainToClass(CreateNotificationDto, invalidData);
      const errors = await validate(dto);
      const typeError = errors.find(error => error.property === 'type');

      expect(typeError).toBeDefined();
      expect(typeError!.constraints).toHaveProperty('isEnum');
    });

    it('should provide appropriate error messages for invalid send_at', async () => {
      const invalidData = { ...mockValidData, send_at: 'invalid' };
      const dto = plainToClass(CreateNotificationDto, invalidData);
      const errors = await validate(dto);
      const sendAtError = errors.find(error => error.property === 'send_at');

      expect(sendAtError).toBeDefined();
      expect(sendAtError!.constraints).toHaveProperty('isDate');
    });
  });
});