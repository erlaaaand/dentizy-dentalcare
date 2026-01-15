import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchMedicalRecordDto } from '../search-medical-record.dto';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

describe('SearchMedicalRecordDto', () => {
  // ==================== MOCK DATA ====================
  const validDto = {
    patient_id: 1,
    doctor_id: 2,
    appointment_id: 3,
    search: 'demam',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    appointment_status: AppointmentStatus.SELESAI,
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'DESC' as 'DESC',
  };

  // ==================== SETUP AND TEARDOWN ====================
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation', () => {
    it('should validate successfully with all fields', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, validDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate successfully with no fields (all optional)', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should use default values', () => {
      const dto = plainToClass(SearchMedicalRecordDto, {});
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.sort_by).toBe('created_at');
      expect(dto.sort_order).toBe('DESC');
    });

    it('should fail when patient_id is not a number', async () => {
      const invalidDto = { patient_id: 'not-a-number' };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when doctor_id is not a number', async () => {
      const invalidDto = { doctor_id: 'not-a-number' };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== DATE VALIDATION TESTS ====================
  describe('Date Validation', () => {
    it('should validate valid start_date', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        start_date: '2025-01-01',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid end_date', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        end_date: '2025-12-31',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid date format', async () => {
      const invalidDto = { start_date: 'invalid-date' };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow date range', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ==================== ENUM VALIDATION TESTS ====================
  describe('Enum Validation', () => {
    it('should validate valid appointment_status', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        appointment_status: AppointmentStatus.SELESAI,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid appointment_status', async () => {
      const invalidDto = { appointment_status: 'INVALID_STATUS' };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate valid sort_order ASC', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        sort_order: 'ASC',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid sort_order DESC', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        sort_order: 'DESC',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid sort_order', async () => {
      const invalidDto = { sort_order: 'INVALID' };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== PAGINATION TESTS ====================
  describe('Pagination', () => {
    it('should transform page string to number', () => {
      const dto = plainToClass(SearchMedicalRecordDto, { page: '5' });
      expect(typeof dto.page).toBe('number');
      expect(dto.page).toBe(5);
    });

    it('should transform limit string to number', () => {
      const dto = plainToClass(SearchMedicalRecordDto, { limit: '20' });
      expect(typeof dto.limit).toBe('number');
      expect(dto.limit).toBe(20);
    });

    it('should use default page value', () => {
      const dto = plainToClass(SearchMedicalRecordDto, {});
      expect(dto.page).toBe(1);
    });

    it('should use default limit value', () => {
      const dto = plainToClass(SearchMedicalRecordDto, {});
      expect(dto.limit).toBe(10);
    });
  });

  // ==================== SEARCH FIELD TESTS ====================
  describe('Search Field', () => {
    it('should accept search string', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        search: 'test search',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.search).toBe('test search');
    });

    it('should fail when search is not a string', async () => {
      const invalidDto = { search: 123 };
      const dto = plainToClass(SearchMedicalRecordDto, invalidDto);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow empty search string', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, { search: '' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ==================== FILTER COMBINATION TESTS ====================
  describe('Filter Combinations', () => {
    it('should allow patient and doctor filter', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        patient_id: 1,
        doctor_id: 2,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow date range with search', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        search: 'demam',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow all filters together', async () => {
      const dto = plainToClass(SearchMedicalRecordDto, validDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
