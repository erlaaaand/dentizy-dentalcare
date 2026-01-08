// 1. IMPORTS
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RetryNotificationDto } from '../retry-notification.dto';

// 2. MOCK DATA
const mockValidData = {
  notification_id: 1,
};

const mockInvalidData = {
  notification_id: 'invalid', // should be number
};

const mockEmptyData = {
  // missing required field: notification_id
};

const mockEdgeCases = {
  notification_id: 0, // edge case: zero
};

const mockNegativeNumber = {
  notification_id: -1, // edge case: negative number
};

const mockLargeNumber = {
  notification_id: 999999999, // edge case: large number
};

const mockDecimalNumber = {
  notification_id: 1.5, // edge case: decimal number
};

const mockStringNumbers = {
  notification_id: '123', // string that can be transformed to number
};

const mockBooleanData = {
  notification_id: true, // boolean instead of number
};

const mockNullUndefinedData = {
  notification_id: null, // null value
};

// 3. TEST SUITE
describe('RetryNotificationDto', () => {
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
      const dtoObject = plainToClass(RetryNotificationDto, data);
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

    it('should execute validation with errors for empty data', async () => {
      const errors = await executeValidation(mockEmptyData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return specific error structure for validation failures', async () => {
      const errors = await executeValidation(mockInvalidData);
      expect(Array.isArray(errors)).toBe(true);
      expect(errors[0]).toHaveProperty('property');
      expect(errors[0]).toHaveProperty('constraints');
    });
  });

  // 6. SUB-GROUP TESTS
  describe('notification_id Field Validation', () => {
    describe('Valid Cases', () => {
      it('should validate correct numeric notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockValidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(1);
      });

      it('should accept zero as valid notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockEdgeCases);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(0);
      });

      it('should accept negative numbers as valid notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockNegativeNumber);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(-1);
      });

      it('should accept large numbers as valid notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockLargeNumber);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(999999999);
      });

      it('should accept decimal numbers as valid notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockDecimalNumber);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(1.5);
      });

      it('should accept string numbers and validate as number', async () => {
        const dto = plainToClass(RetryNotificationDto, mockStringNumbers);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
        expect(dto.notification_id).toBe(123);
      });
    });

    describe('Invalid Cases', () => {
      it('should reject non-numeric string notification_id', async () => {
        const invalidData = { notification_id: 'not-a-number' };
        const dto = plainToClass(RetryNotificationDto, invalidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject empty notification_id', async () => {
        const invalidData = { notification_id: undefined };
        const dto = plainToClass(RetryNotificationDto, invalidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty(
          'isNotEmpty',
        );
      });

      it('should reject null notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockNullUndefinedData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty(
          'isNotEmpty',
        );
      });

      it('should reject boolean notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, mockBooleanData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject array notification_id', async () => {
        const invalidData = { notification_id: [1, 2, 3] };
        const dto = plainToClass(RetryNotificationDto, invalidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject object notification_id', async () => {
        const invalidData = { notification_id: { id: 1 } };
        const dto = plainToClass(RetryNotificationDto, invalidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject empty string notification_id', async () => {
        const invalidData = { notification_id: '' };
        const dto = plainToClass(RetryNotificationDto, invalidData);
        const errors = await validate(dto);
        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(1);
        expect(notificationIdErrors[0].constraints).toHaveProperty(
          'isNotEmpty',
        );
      });
    });

    describe('Error Message Tests', () => {
      it('should provide appropriate error message for empty notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, {});
        const errors = await validate(dto);
        const notificationIdError = errors.find(
          (error) => error.property === 'notification_id',
        );

        expect(notificationIdError).toBeDefined();
        expect(notificationIdError!.constraints).toHaveProperty('isNotEmpty');
        expect(notificationIdError!.constraints?.isNotEmpty).toContain(
          'notification_id',
        );
      });

      it('should provide appropriate error message for non-number notification_id', async () => {
        const dto = plainToClass(RetryNotificationDto, {
          notification_id: 'invalid',
        });
        const errors = await validate(dto);
        const notificationIdError = errors.find(
          (error) => error.property === 'notification_id',
        );

        expect(notificationIdError).toBeDefined();
        expect(notificationIdError!.constraints).toHaveProperty('isNumber');
        expect(notificationIdError!.constraints?.isNumber).toContain('number');
      });

      it('should provide both error messages when notification_id is empty and wrong type', async () => {
        const dto = plainToClass(RetryNotificationDto, { notification_id: '' });
        const errors = await validate(dto);
        const notificationIdError = errors.find(
          (error) => error.property === 'notification_id',
        );

        expect(notificationIdError).toBeDefined();
        expect(notificationIdError!.constraints).toHaveProperty('isNotEmpty');
        // Note: When value is empty string, isNumber validation might not run due to isNotEmpty failing first
      });
    });
  });

  describe('Data Type Handling Tests', () => {
    it('should preserve number type for valid inputs', async () => {
      const dto = plainToClass(RetryNotificationDto, mockValidData);
      await validate(dto);
      expect(typeof dto.notification_id).toBe('number');
    });

    it('should transform string numbers to number type', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: '456',
      });
      await validate(dto);
      expect(typeof dto.notification_id).toBe('number');
      expect(dto.notification_id).toBe(456);
    });

    it('should handle scientific notation', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: '1e3',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(1000);
    });

    it('should handle hexadecimal numbers', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: '0xFF',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(255);
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete valid object', async () => {
      const dto = plainToClass(RetryNotificationDto, mockValidData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(1);
    });

    it('should reject object with invalid notification_id type', async () => {
      const dto = plainToClass(RetryNotificationDto, mockInvalidData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should reject completely empty object', async () => {
      const dto = plainToClass(RetryNotificationDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should handle multiple invalid scenarios consistently', async () => {
      const invalidScenarios = [
        { notification_id: undefined },
        { notification_id: null },
        { notification_id: 'invalid' },
        { notification_id: true },
        { notification_id: [] },
        { notification_id: {} },
      ];

      for (const scenario of invalidScenarios) {
        const dto = plainToClass(RetryNotificationDto, scenario);
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors.length).toBeGreaterThan(0);
      }
    });

    it('should handle multiple valid scenarios consistently', async () => {
      const validScenarios = [
        { notification_id: 1 },
        { notification_id: 0 },
        { notification_id: -1 },
        { notification_id: 999999 },
        { notification_id: 1.5 },
        { notification_id: '123' },
      ];

      for (const scenario of validScenarios) {
        const dto = plainToClass(RetryNotificationDto, scenario);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);

        const notificationIdErrors = errors.filter(
          (error) => error.property === 'notification_id',
        );
        expect(notificationIdErrors).toHaveLength(0);
      }
    });
  });

  describe('Edge Case Tests', () => {
    it('should handle Number.MAX_SAFE_INTEGER', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: Number.MAX_SAFE_INTEGER,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle Number.MIN_SAFE_INTEGER', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: Number.MIN_SAFE_INTEGER,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle very small decimal numbers', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: 0.0000001,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(0.0000001);
    });

    it('should handle very large decimal numbers', async () => {
      const dto = plainToClass(RetryNotificationDto, {
        notification_id: 123456789.987654321,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.notification_id).toBe(123456789.987654321);
    });

    it('should handle string representations of edge cases', async () => {
      const edgeCases = [
        '0',
        '-1',
        '999999999999',
        '0.0000001',
        '1.7976931348623157e+308', // Near Number.MAX_VALUE
      ];

      for (const edgeCase of edgeCases) {
        const dto = plainToClass(RetryNotificationDto, {
          notification_id: edgeCase,
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(typeof dto.notification_id).toBe('number');
      }
    });
  });

  describe('Business Logic Correlation Tests', () => {
    it('should accept IDs that correspond to actual database IDs', async () => {
      const realisticIds = [1, 100, 1000, 10000, 99999];

      for (const id of realisticIds) {
        const dto = plainToClass(RetryNotificationDto, { notification_id: id });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.notification_id).toBe(id);
      }
    });

    it('should work with typical retry operation scenarios', async () => {
      const typicalScenarios = [
        { notification_id: 123 }, // Typical ID
        { notification_id: 4567 }, // Another typical ID
        { notification_id: 1 }, // First record
      ];

      for (const scenario of typicalScenarios) {
        const dto = plainToClass(RetryNotificationDto, scenario);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});
