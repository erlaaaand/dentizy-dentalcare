// 1. IMPORTS
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { QueryNotificationsDto } from '../query-notifications.dto';
import {
  NotificationStatus,
  NotificationType,
} from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockValidQueryData = {
  status: NotificationStatus.PENDING,
  type: NotificationType.EMAIL_REMINDER,
  page: 1,
  limit: 10,
};

const mockPartialQueryData = {
  status: NotificationStatus.SENT,
  // type, page, limit are optional and should use defaults
};

const mockEmptyQueryData = {
  // All fields are optional, empty object should be valid
};

const mockInvalidQueryData = {
  status: 'INVALID_STATUS', // invalid enum
  type: 'INVALID_TYPE', // invalid enum
  page: 'invalid_page', // not a number
  limit: 'invalid_limit', // not a number
};

const mockEdgeCaseData = {
  page: 1, // minimum valid page
  limit: 1, // minimum valid limit
  status: NotificationStatus.FAILED,
  type: NotificationType.EMAIL_REMINDER,
};

const mockMaxLimitData = {
  limit: 100, // maximum valid limit
  page: 999, // large page number
};

const mockAllStatusValues = Object.values(NotificationStatus).map((status) => ({
  status,
  page: 1,
  limit: 10,
}));

const mockAllTypeValues = Object.values(NotificationType).map((type) => ({
  type,
  page: 1,
  limit: 10,
}));

const mockInvalidNumbers = {
  page: 0, // below minimum
  limit: 0, // below minimum
};

const mockExceedMaxLimit = {
  limit: 101, // above maximum
  page: 1,
};

const mockNegativeNumbers = {
  page: -1,
  limit: -5,
};

const mockDecimalNumbers = {
  page: 1.5,
  limit: 15.7,
};

// 3. TEST SUITE
describe('QueryNotificationsDto', () => {
  // 4. SETUP AND TEARDOWN
  let validationErrors: any[];

  beforeEach(() => {
    validationErrors = [];
  });

  afterEach(() => {
    validationErrors = [];
  });

  // 5. EXECUTE METHOD TESTS
  describe('Validation and Transformation Method Tests', () => {
    const executeValidation = async (data: any): Promise<any[]> => {
      const dtoObject = plainToClass(QueryNotificationsDto, data);
      return await validate(dtoObject);
    };

    it('should execute validation without errors for valid data', async () => {
      const errors = await executeValidation(mockValidQueryData);
      expect(errors).toHaveLength(0);
    });

    it('should execute validation with errors for invalid data', async () => {
      const errors = await executeValidation(mockInvalidQueryData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should transform string numbers to actual numbers', async () => {
      const dataWithStringNumbers = {
        page: '2',
        limit: '15',
      };

      const dto = plainToClass(QueryNotificationsDto, dataWithStringNumbers);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(15);
    });

    it('should apply default values when fields are not provided', async () => {
      const dto = plainToClass(QueryNotificationsDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Field Validation Tests', () => {
    describe('status field', () => {
      it('should validate correct NotificationStatus', async () => {
        const dto = plainToClass(QueryNotificationsDto, {
          status: NotificationStatus.PENDING,
        });
        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
      });

      it('should reject invalid NotificationStatus', async () => {
        const dto = plainToClass(QueryNotificationsDto, {
          status: 'INVALID_STATUS',
        });
        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(1);
        expect(statusErrors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept all valid NotificationStatus values', async () => {
        for (const status of Object.values(NotificationStatus)) {
          const dto = plainToClass(QueryNotificationsDto, { status });
          const errors = await validate(dto);
          const statusErrors = errors.filter(
            (error) => error.property === 'status',
          );
          expect(statusErrors).toHaveLength(0);
        }
      });

      it('should be optional when not provided', async () => {
        const dto = plainToClass(QueryNotificationsDto, {});
        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
        expect(dto.status).toBeUndefined();
      });

      it('should accept null value', async () => {
        const dto = plainToClass(QueryNotificationsDto, { status: null });
        const errors = await validate(dto);
        const statusErrors = errors.filter(
          (error) => error.property === 'status',
        );
        expect(statusErrors).toHaveLength(0);
      });
    });

    describe('type field', () => {
      it('should validate correct NotificationType', async () => {
        const dto = plainToClass(QueryNotificationsDto, {
          type: NotificationType.EMAIL_REMINDER,
        });
        const errors = await validate(dto);
        const typeErrors = errors.filter((error) => error.property === 'type');
        expect(typeErrors).toHaveLength(0);
      });

      it('should reject invalid NotificationType', async () => {
        const dto = plainToClass(QueryNotificationsDto, {
          type: 'INVALID_TYPE',
        });
        const errors = await validate(dto);
        const typeErrors = errors.filter((error) => error.property === 'type');
        expect(typeErrors).toHaveLength(1);
        expect(typeErrors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept all valid NotificationType values', async () => {
        for (const type of Object.values(NotificationType)) {
          const dto = plainToClass(QueryNotificationsDto, { type });
          const errors = await validate(dto);
          const typeErrors = errors.filter(
            (error) => error.property === 'type',
          );
          expect(typeErrors).toHaveLength(0);
        }
      });

      it('should be optional when not provided', async () => {
        const dto = plainToClass(QueryNotificationsDto, {});
        const errors = await validate(dto);
        const typeErrors = errors.filter((error) => error.property === 'type');
        expect(typeErrors).toHaveLength(0);
        expect(dto.type).toBeUndefined();
      });

      it('should accept null value', async () => {
        const dto = plainToClass(QueryNotificationsDto, { type: null });
        const errors = await validate(dto);
        const typeErrors = errors.filter((error) => error.property === 'type');
        expect(typeErrors).toHaveLength(0);
      });
    });

    describe('page field', () => {
      it('should validate correct page number', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: 5 });
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(0);
        expect(dto.page).toBe(5);
      });

      it('should reject non-number page', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: 'invalid' });
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(1);
        expect(pageErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject page below minimum', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: 0 });
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(1);
        expect(pageErrors[0].constraints).toHaveProperty('min');
      });

      it('should reject negative page', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: -1 });
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(1);
        expect(pageErrors[0].constraints).toHaveProperty('min');
      });

      it('should transform string page to number', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: '3' });
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(0);
        expect(dto.page).toBe(3);
      });

      it('should use default value when page is not provided', async () => {
        const dto = plainToClass(QueryNotificationsDto, {});
        const errors = await validate(dto);
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(0);
        expect(dto.page).toBe(1);
      });

      it('should accept decimal numbers but validate as integer', async () => {
        const dto = plainToClass(QueryNotificationsDto, { page: 2.5 });
        const errors = await validate(dto);
        // Decimal numbers pass isNumber validation but might fail in business logic
        const pageErrors = errors.filter((error) => error.property === 'page');
        expect(pageErrors).toHaveLength(0);
      });
    });

    describe('limit field', () => {
      it('should validate correct limit number', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 50 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(0);
        expect(dto.limit).toBe(50);
      });

      it('should reject non-number limit', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 'invalid' });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(1);
        expect(limitErrors[0].constraints).toHaveProperty('isNumber');
      });

      it('should reject limit below minimum', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 0 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(1);
        expect(limitErrors[0].constraints).toHaveProperty('min');
      });

      it('should reject limit above maximum', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 101 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(1);
        expect(limitErrors[0].constraints).toHaveProperty('max');
      });

      it('should reject negative limit', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: -5 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(1);
        expect(limitErrors[0].constraints).toHaveProperty('min');
      });

      it('should transform string limit to number', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: '25' });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(0);
        expect(dto.limit).toBe(25);
      });

      it('should use default value when limit is not provided', async () => {
        const dto = plainToClass(QueryNotificationsDto, {});
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(0);
        expect(dto.limit).toBe(20);
      });

      it('should accept minimum valid limit', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 1 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(0);
        expect(dto.limit).toBe(1);
      });

      it('should accept maximum valid limit', async () => {
        const dto = plainToClass(QueryNotificationsDto, { limit: 100 });
        const errors = await validate(dto);
        const limitErrors = errors.filter(
          (error) => error.property === 'limit',
        );
        expect(limitErrors).toHaveLength(0);
        expect(dto.limit).toBe(100);
      });
    });
  });

  describe('Combination Tests', () => {
    it('should validate with both status and type filters', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        status: NotificationStatus.SENT,
        type: NotificationType.EMAIL_REMINDER,
        page: 2,
        limit: 15,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBe(NotificationStatus.SENT);
      expect(dto.type).toBe(NotificationType.EMAIL_REMINDER);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(15);
    });

    it('should validate with only pagination parameters', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        page: 3,
        limit: 30,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBeUndefined();
      expect(dto.type).toBeUndefined();
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(30);
    });

    it('should validate with only filter parameters', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        status: NotificationStatus.PENDING,
        type: NotificationType.EMAIL_REMINDER,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBe(NotificationStatus.PENDING);
      expect(dto.type).toBe(NotificationType.EMAIL_REMINDER);
      expect(dto.page).toBe(1); // default
      expect(dto.limit).toBe(20); // default
    });

    it('should validate empty query object', async () => {
      const dto = plainToClass(QueryNotificationsDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBeUndefined();
      expect(dto.type).toBeUndefined();
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });
  });

  describe('Edge Case Tests', () => {
    it('should handle very large page numbers', async () => {
      const dto = plainToClass(QueryNotificationsDto, { page: 999999 });
      const errors = await validate(dto);
      const pageErrors = errors.filter((error) => error.property === 'page');
      expect(pageErrors).toHaveLength(0);
      expect(dto.page).toBe(999999);
    });

    it('should handle boundary limit values', async () => {
      const minLimitDto = plainToClass(QueryNotificationsDto, { limit: 1 });
      const maxLimitDto = plainToClass(QueryNotificationsDto, { limit: 100 });

      const minErrors = await validate(minLimitDto);
      const maxErrors = await validate(maxLimitDto);

      expect(minErrors).toHaveLength(0);
      expect(maxErrors).toHaveLength(0);
      expect(minLimitDto.limit).toBe(1);
      expect(maxLimitDto.limit).toBe(100);
    });

    it('should handle decimal numbers in pagination', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        page: 1.7,
        limit: 25.3,
      });
      const errors = await validate(dto);
      // Decimal numbers pass validation but should be handled in business logic
      expect(errors).toHaveLength(0);
    });

    it('should handle null values for optional fields', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        status: null,
        type: null,
        page: null,
        limit: null,
      });
      const errors = await validate(dto);
      // Null values pass @IsOptional validation
      expect(errors).toHaveLength(0);
    });
  });

  describe('Error Message Tests', () => {
    it('should provide appropriate error messages for invalid status', async () => {
      const dto = plainToClass(QueryNotificationsDto, { status: 'INVALID' });
      const errors = await validate(dto);
      const statusError = errors.find((error) => error.property === 'status');

      expect(statusError).toBeDefined();
      expect(statusError!.constraints).toHaveProperty('isEnum');
    });

    it('should provide appropriate error messages for invalid type', async () => {
      const dto = plainToClass(QueryNotificationsDto, { type: 'INVALID' });
      const errors = await validate(dto);
      const typeError = errors.find((error) => error.property === 'type');

      expect(typeError).toBeDefined();
      expect(typeError!.constraints).toHaveProperty('isEnum');
    });

    it('should provide appropriate error messages for invalid page', async () => {
      const dto = plainToClass(QueryNotificationsDto, { page: 0 });
      const errors = await validate(dto);
      const pageError = errors.find((error) => error.property === 'page');

      expect(pageError).toBeDefined();
      expect(pageError!.constraints).toHaveProperty('min');
    });

    it('should provide appropriate error messages for invalid limit', async () => {
      const dto = plainToClass(QueryNotificationsDto, { limit: 150 });
      const errors = await validate(dto);
      const limitError = errors.find((error) => error.property === 'limit');

      expect(limitError).toBeDefined();
      expect(limitError!.constraints).toHaveProperty('max');
    });
  });

  describe('Transformation Tests', () => {
    it('should transform all string numbers to numbers', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        page: '5',
        limit: '25',
      });

      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
      expect(dto.page).toBe(5);
      expect(dto.limit).toBe(25);
    });

    it('should handle mixed data types correctly', async () => {
      const dto = plainToClass(QueryNotificationsDto, {
        status: NotificationStatus.PENDING, // valid enum
        type: NotificationType.EMAIL_REMINDER, // string that matches enum
        page: '10', // string number
        limit: 50, // actual number
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.status).toBe(NotificationStatus.PENDING);
      expect(dto.type).toBe(NotificationType.EMAIL_REMINDER);
      expect(dto.page).toBe(10);
      expect(dto.limit).toBe(50);
    });
  });
});
