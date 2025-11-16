import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FindAppointmentsQueryDto } from '../find-appointments-query.dto';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('FindAppointmentsQueryDto', () => {
  // --- 1. Tes Skenario Sukses ---

  it('should pass validation with all properties valid', async () => {
    const data = {
      doctorId: 1,
      date: '2024-01-15',
      status: AppointmentStatus.DIJADWALKAN,
      page: 2,
      limit: 20,
    };

    const dto = plainToInstance(FindAppointmentsQueryDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with only some optional properties', async () => {
    const data = {
      doctorId: 1,
      page: 1,
    };

    const dto = plainToInstance(FindAppointmentsQueryDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object (all properties optional)', async () => {
    const data = {};

    const dto = plainToInstance(FindAppointmentsQueryDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should set default values for page and limit when not provided', async () => {
    const data = {};

    const dto = plainToInstance(FindAppointmentsQueryDto, data);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  // --- 2. Tes Transformasi Type ---

  describe('Type Transformation', () => {
    it('should transform string doctorId to number', async () => {
      const data = { doctorId: '5' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);

      expect(dto.doctorId).toBe(5);
      expect(typeof dto.doctorId).toBe('number');
    });

    it('should transform string page to number', async () => {
      const data = { page: '3' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);

      expect(dto.page).toBe(3);
      expect(typeof dto.page).toBe('number');
    });

    it('should transform string limit to number', async () => {
      const data = { limit: '15' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);

      expect(dto.limit).toBe(15);
      expect(typeof dto.limit).toBe('number');
    });
  });

  // --- 3. Tes Properti 'doctorId' ---

  describe('doctorId', () => {
    it('should fail if doctorId is not a number', async () => {
      const data = { doctorId: 'not-a-number' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const doctorIdError = errors.find(error => error.property === 'doctorId');
      expect(doctorIdError?.constraints).toBeDefined();
      expect(doctorIdError?.constraints?.isNumber).toBeDefined();
    });

    it('should pass if doctorId is valid number', async () => {
      const data = { doctorId: 123 };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  // --- 4. Tes Properti 'date' ---

  describe('date', () => {
    it('should fail if date format is invalid', async () => {
      const data = { date: '15-01-2024' }; // Format harus YYYY-MM-DD

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find(error => error.property === 'date');
      expect(dateError?.constraints).toBeDefined();
      expect(dateError?.constraints?.isDateString).toBeDefined();
    });

    it('should pass if date format is valid (YYYY-MM-DD)', async () => {
      const data = { date: '2024-01-15' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with empty date', async () => {
      const data = {};

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      // Empty string should pass because @IsOptional() allows undefined/empty
      expect(errors.length).toBe(0);
    });
  });

  // --- 5. Tes Properti 'status' ---

  describe('status', () => {
    it('should fail if status is not a valid enum value', async () => {
      const data = { status: 'INVALID_STATUS' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find(error => error.property === 'status');
      expect(statusError?.constraints).toBeDefined();
      expect(statusError?.constraints?.isEnum).toBeDefined();
    });

    it('should pass if status is a valid enum value', async () => {
      const data = { status: AppointmentStatus.SELESAI };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with all possible enum values', async () => {
      const enumValues = Object.values(AppointmentStatus);

      for (const status of enumValues) {
        const data = { status };
        const dto = plainToInstance(FindAppointmentsQueryDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
      }
    });
  });

  // --- 6. Tes Properti 'page' ---

  describe('page', () => {
    it('should fail if page is less than 1', async () => {
      const data = { page: 0 };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find(error => error.property === 'page');
      expect(pageError?.constraints).toBeDefined();
      expect(pageError?.constraints?.min).toBeDefined();
    });

    it('should fail if page is not a number', async () => {
      const data = { page: 'invalid' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find(error => error.property === 'page');
      expect(pageError?.constraints).toBeDefined();
      expect(pageError?.constraints?.isNumber).toBeDefined();
    });

    it('should pass if page is valid number >= 1', async () => {
      const data = { page: 1 };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should set default page to 1 when not provided', async () => {
      const data = {};

      const dto = plainToInstance(FindAppointmentsQueryDto, data);

      expect(dto.page).toBe(1);
    });
  });

  // --- 7. Tes Properti 'limit' ---

  describe('limit', () => {
    it('should fail if limit is less than 1', async () => {
      const data = { limit: 0 };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find(error => error.property === 'limit');
      expect(limitError?.constraints).toBeDefined();
      expect(limitError?.constraints?.min).toBeDefined();
    });

    it('should fail if limit is not a number', async () => {
      const data = { limit: 'invalid' };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find(error => error.property === 'limit');
      expect(limitError?.constraints).toBeDefined();
      expect(limitError?.constraints?.isNumber).toBeDefined();
    });

    it('should pass if limit is valid number >= 1', async () => {
      const data = { limit: 50 };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should set default limit to 10 when not provided', async () => {
      const data = {};

      const dto = plainToInstance(FindAppointmentsQueryDto, data);

      expect(dto.limit).toBe(10);
    });
  });

  // --- 8. Tes Kombinasi Properti ---

  describe('Combination of properties', () => {
    it('should pass with doctorId and date combination', async () => {
      const data = {
        doctorId: 1,
        date: '2024-01-15',
      };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with status and pagination combination', async () => {
      const data = {
        status: AppointmentStatus.DIBATALKAN,
        page: 2,
        limit: 5,
      };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with all filter criteria combined', async () => {
      const data = {
        doctorId: 5,
        date: '2024-01-20',
        status: AppointmentStatus.DIJADWALKAN,
        page: 3,
        limit: 25,
      };

      const dto = plainToInstance(FindAppointmentsQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});