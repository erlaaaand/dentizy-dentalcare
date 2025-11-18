import { FindAllMedicalRecordQueryDto } from '../find-all-medical-record.dto';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

describe('FindAllMedicalRecordQueryDto', () => {
  // ==================== MOCK DATA ====================
  const validDto: FindAllMedicalRecordQueryDto = {
    patientId: 1,
    doctorId: 2,
    appointmentId: 3,
    search: 'demam',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: AppointmentStatus.SELESAI,
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  };

  // ==================== SETUP AND TEARDOWN ====================
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== DTO STRUCTURE TESTS ====================
  describe('DTO Structure', () => {
    it('should create DTO with all properties', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto).toBeDefined();
      expect(dto).toHaveProperty('patientId');
      expect(dto).toHaveProperty('doctorId');
      expect(dto).toHaveProperty('appointmentId');
      expect(dto).toHaveProperty('search');
      expect(dto).toHaveProperty('startDate');
      expect(dto).toHaveProperty('endDate');
      expect(dto).toHaveProperty('status');
      expect(dto).toHaveProperty('page');
      expect(dto).toHaveProperty('limit');
      expect(dto).toHaveProperty('sortBy');
      expect(dto).toHaveProperty('sortOrder');
    });

    it('should allow all properties to be optional', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.patientId).toBeUndefined();
      expect(dto.doctorId).toBeUndefined();
      expect(dto.appointmentId).toBeUndefined();
      expect(dto.search).toBeUndefined();
      expect(dto.startDate).toBeUndefined();
      expect(dto.endDate).toBeUndefined();
      expect(dto.status).toBeUndefined();
      expect(dto.page).toBeUndefined();
      expect(dto.limit).toBeUndefined();
      expect(dto.sortBy).toBeUndefined();
      expect(dto.sortOrder).toBeUndefined();
    });
  });

  // ==================== FILTER PROPERTIES TESTS ====================
  describe('Filter Properties', () => {
    it('should accept patientId as number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.patientId = 1;

      expect(dto.patientId).toBe(1);
      expect(typeof dto.patientId).toBe('number');
    });

    it('should accept doctorId as number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.doctorId = 2;

      expect(dto.doctorId).toBe(2);
      expect(typeof dto.doctorId).toBe('number');
    });

    it('should accept appointmentId as number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.appointmentId = 3;

      expect(dto.appointmentId).toBe(3);
      expect(typeof dto.appointmentId).toBe('number');
    });

    it('should accept search as string', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.search = 'test search';

      expect(dto.search).toBe('test search');
      expect(typeof dto.search).toBe('string');
    });

    it('should accept empty search string', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.search = '';

      expect(dto.search).toBe('');
    });
  });

  // ==================== DATE PROPERTIES TESTS ====================
  describe('Date Properties', () => {
    it('should accept startDate as Date', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      const date = new Date('2025-01-01');
      dto.startDate = date;

      expect(dto.startDate).toEqual(date);
      expect(dto.startDate).toBeInstanceOf(Date);
    });

    it('should accept endDate as Date', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      const date = new Date('2025-12-31');
      dto.endDate = date;

      expect(dto.endDate).toEqual(date);
      expect(dto.endDate).toBeInstanceOf(Date);
    });

    it('should allow date range', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.startDate = new Date('2025-01-01');
      dto.endDate = new Date('2025-12-31');

      expect(dto.startDate).toBeDefined();
      expect(dto.endDate).toBeDefined();
      expect(dto.startDate < dto.endDate).toBe(true);
    });

    it('should allow only startDate', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.startDate = new Date('2025-01-01');

      expect(dto.startDate).toBeDefined();
      expect(dto.endDate).toBeUndefined();
    });

    it('should allow only endDate', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.endDate = new Date('2025-12-31');

      expect(dto.endDate).toBeDefined();
      expect(dto.startDate).toBeUndefined();
    });
  });

  // ==================== STATUS PROPERTY TESTS ====================
  describe('Status Property', () => {
    it('should accept valid AppointmentStatus', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.status = AppointmentStatus.SELESAI;

      expect(dto.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should accept TERJADWAL status', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.status = AppointmentStatus.TERJADWAL;

      expect(dto.status).toBe(AppointmentStatus.TERJADWAL);
    });

    it('should accept DIBATALKAN status', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.status = AppointmentStatus.DIBATALKAN;

      expect(dto.status).toBe(AppointmentStatus.DIBATALKAN);
    });

    it('should allow undefined status', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.status).toBeUndefined();
    });
  });

  // ==================== PAGINATION PROPERTIES TESTS ====================
  describe('Pagination Properties', () => {
    it('should accept page as number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.page = 1;

      expect(dto.page).toBe(1);
      expect(typeof dto.page).toBe('number');
    });

    it('should accept limit as number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.limit = 10;

      expect(dto.limit).toBe(10);
      expect(typeof dto.limit).toBe('number');
    });

    it('should allow custom page values', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.page = 5;

      expect(dto.page).toBe(5);
    });

    it('should allow custom limit values', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.limit = 50;

      expect(dto.limit).toBe(50);
    });

    it('should allow page to be undefined', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.page).toBeUndefined();
    });

    it('should allow limit to be undefined', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.limit).toBeUndefined();
    });
  });

  // ==================== SORTING PROPERTIES TESTS ====================
  describe('Sorting Properties', () => {
    it('should accept sortBy as string', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.sortBy = 'created_at';

      expect(dto.sortBy).toBe('created_at');
      expect(typeof dto.sortBy).toBe('string');
    });

    it('should accept sortOrder as ASC', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.sortOrder = 'ASC';

      expect(dto.sortOrder).toBe('ASC');
    });

    it('should accept sortOrder as DESC', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.sortOrder = 'DESC';

      expect(dto.sortOrder).toBe('DESC');
    });

    it('should allow different sortBy fields', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      dto.sortBy = 'updated_at';
      expect(dto.sortBy).toBe('updated_at');

      dto.sortBy = 'appointment_date';
      expect(dto.sortBy).toBe('appointment_date');

      dto.sortBy = 'patient_name';
      expect(dto.sortBy).toBe('patient_name');
    });

    it('should allow sortBy to be undefined', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.sortBy).toBeUndefined();
    });

    it('should allow sortOrder to be undefined', () => {
      const dto = new FindAllMedicalRecordQueryDto();

      expect(dto.sortOrder).toBeUndefined();
    });
  });

  // ==================== COMBINATION TESTS ====================
  describe('Filter Combinations', () => {
    it('should allow patient and doctor filter together', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.patientId = 1;
      dto.doctorId = 2;

      expect(dto.patientId).toBe(1);
      expect(dto.doctorId).toBe(2);
    });

    it('should allow all filters together', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      Object.assign(dto, validDto);

      expect(dto.patientId).toBe(1);
      expect(dto.doctorId).toBe(2);
      expect(dto.appointmentId).toBe(3);
      expect(dto.search).toBe('demam');
      expect(dto.startDate).toBeDefined();
      expect(dto.endDate).toBeDefined();
      expect(dto.status).toBe(AppointmentStatus.SELESAI);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.sortBy).toBe('created_at');
      expect(dto.sortOrder).toBe('DESC');
    });

    it('should allow search with date range', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.search = 'demam';
      dto.startDate = new Date('2025-01-01');
      dto.endDate = new Date('2025-12-31');

      expect(dto.search).toBe('demam');
      expect(dto.startDate).toBeDefined();
      expect(dto.endDate).toBeDefined();
    });

    it('should allow status with pagination', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.status = AppointmentStatus.SELESAI;
      dto.page = 2;
      dto.limit = 20;

      expect(dto.status).toBe(AppointmentStatus.SELESAI);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(20);
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle zero values for IDs', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.patientId = 0;
      dto.doctorId = 0;

      expect(dto.patientId).toBe(0);
      expect(dto.doctorId).toBe(0);
    });

    it('should handle negative page number', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.page = -1;

      expect(dto.page).toBe(-1);
    });

    it('should handle zero limit', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.limit = 0;

      expect(dto.limit).toBe(0);
    });

    it('should handle very long search string', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.search = 'a'.repeat(1000);

      expect(dto.search.length).toBe(1000);
    });

    it('should handle special characters in search', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      dto.search = '!@#$%^&*()';

      expect(dto.search).toBe('!@#$%^&*()');
    });

    it('should handle same start and end date', () => {
      const dto = new FindAllMedicalRecordQueryDto();
      const date = new Date('2025-01-01');
      dto.startDate = date;
      dto.endDate = date;

      expect(dto.startDate).toEqual(dto.endDate);
    });
  });
});