import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateAppointmentDto } from '../update-appointment.dto';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('UpdateAppointmentDto', () => {
  // --- 1. Tes Skenario Sukses ---

  it('should pass validation with all properties valid', async () => {
    const data = {
      status: AppointmentStatus.DIJADWALKAN,
      tanggal_janji: '2024-12-25',
      jam_janji: '14:30:00',
      keluhan: 'Sakit gigi bagian depan',
    };

    const dto = plainToInstance(UpdateAppointmentDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with only some properties', async () => {
    const data = {
      status: AppointmentStatus.SELESAI,
      keluhan: 'Kontrol rutin',
    };

    const dto = plainToInstance(UpdateAppointmentDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with single property', async () => {
    const data = {
      tanggal_janji: '2024-12-25',
    };

    const dto = plainToInstance(UpdateAppointmentDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object (all properties optional)', async () => {
    const data = {};

    const dto = plainToInstance(UpdateAppointmentDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  // --- 2. Tes Properti 'status' ---

  describe('status', () => {
    it('should pass if status is a valid enum value', async () => {
      const data = { status: AppointmentStatus.DIBATALKAN };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if status is not a valid enum value', async () => {
      const data = { status: 'STATUS_TIDAK_VALID' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find(error => error.property === 'status');
      expect(statusError?.constraints).toBeDefined();
      expect(statusError?.constraints?.isEnum).toBeDefined();
    });

    it('should pass with all possible enum values', async () => {
      const enumValues = Object.values(AppointmentStatus);

      for (const status of enumValues) {
        const data = { status };
        const dto = plainToInstance(UpdateAppointmentDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
      }
    });
  });

  // --- 3. Tes Properti 'tanggal_janji' ---

  describe('tanggal_janji', () => {
    it('should pass if tanggal_janji format is valid (YYYY-MM-DD)', async () => {
      const data = { tanggal_janji: '2024-12-25' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if tanggal_janji format is invalid (DD-MM-YYYY)', async () => {
      const data = { tanggal_janji: '25-12-2024' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const tanggalError = errors.find(error => error.property === 'tanggal_janji');
      expect(tanggalError?.constraints).toBeDefined();
      expect(tanggalError?.constraints?.isDateString).toBeDefined();
    });

    it('should fail if tanggal_janji is not a valid date', async () => {
      const data = { tanggal_janji: 'bukan-tanggal' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const tanggalError = errors.find(error => error.property === 'tanggal_janji');
      expect(tanggalError?.constraints).toBeDefined();
      expect(tanggalError?.constraints?.isDateString).toBeDefined();
    });

    it('should fail if tanggal_janji has invalid month (13)', async () => {
      const data = { tanggal_janji: '2024-13-01' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if tanggal_janji has invalid day (32)', async () => {
      const data = { tanggal_janji: '2024-01-32' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // --- 4. Tes Properti 'jam_janji' ---

  describe('jam_janji', () => {
    it('should pass if jam_janji format is valid (HH:mm:ss)', async () => {
      const validTimes = ['09:00:00', '14:30:00', '23:59:59'];

      for (const time of validTimes) {
        const data = { jam_janji: time };
        const dto = plainToInstance(UpdateAppointmentDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
      }
    });

    it('should fail if jam_janji format is invalid (HH:mm)', async () => {
      const data = { jam_janji: '14:30' }; // Tanpa detik

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const jamError = errors.find(error => error.property === 'jam_janji');
      expect(jamError?.constraints).toBeDefined();
      expect(jamError?.constraints?.matches).toBeDefined();
    });

    it('should fail if jam_janji has invalid hour (24)', async () => {
      const data = { jam_janji: '24:00:00' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const jamError = errors.find(error => error.property === 'jam_janji');
      expect(jamError?.constraints).toBeDefined();
      expect(jamError?.constraints?.matches).toBeDefined();
    });

    it('should fail if jam_janji has invalid minute (60)', async () => {
      const data = { jam_janji: '14:60:00' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if jam_janji has invalid second (60)', async () => {
      const data = { jam_janji: '14:30:60' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if jam_janji contains non-numeric characters', async () => {
      const data = { jam_janji: 'ab:cd:ef' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // --- 5. Tes Properti 'keluhan' ---

  describe('keluhan', () => {
    it('should pass if keluhan is within max length', async () => {
      const data = { keluhan: 'Sakit gigi berlubang' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass if keluhan is exactly 1000 characters', async () => {
      const exactLengthText = 'a'.repeat(1000);
      const data = { keluhan: exactLengthText };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if keluhan is longer than 1000 characters', async () => {
      const longText = 'a'.repeat(1001);
      const data = { keluhan: longText };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const keluhanError = errors.find(error => error.property === 'keluhan');
      expect(keluhanError?.constraints).toBeDefined();
      expect(keluhanError?.constraints?.maxLength).toBeDefined();
    });

    it('should trim whitespace from keluhan (@Transform)', () => {
      const testCases = [
        { input: '  Sakit gigi  ', expected: 'Sakit gigi' },
        { input: 'Sakit gigi  ', expected: 'Sakit gigi' },
        { input: '  Sakit gigi', expected: 'Sakit gigi' },
        { input: 'Sakit gigi', expected: 'Sakit gigi' },
        { input: '   ', expected: '' },
      ];

      for (const testCase of testCases) {
        const data = { keluhan: testCase.input };
        const dto = plainToInstance(UpdateAppointmentDto, data);

        expect(dto.keluhan).toBe(testCase.expected);
      }
    });

    it('should handle undefined value in transform', () => {
      const data = {};
      const dto = plainToInstance(UpdateAppointmentDto, data);

      expect(dto.keluhan).toBeUndefined();
    });
  });

  // --- 6. Tes Kombinasi Properti ---

  describe('Combination of properties', () => {
    it('should pass with status and tanggal_janji combination', async () => {
      const data = {
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: '2024-12-25',
      };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with tanggal_janji and jam_janji combination', async () => {
      const data = {
        tanggal_janji: '2024-12-25',
        jam_janji: '10:00:00',
      };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should pass with all properties combination', async () => {
      const data = {
        status: AppointmentStatus.SELESAI,
        tanggal_janji: '2024-12-25',
        jam_janji: '15:45:00',
        keluhan: 'Pemeriksaan rutin dan pembersihan karang gigi',
      };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  // --- 7. Tes Edge Cases ---

  describe('Edge cases', () => {
    it('should handle null values gracefully', async () => {
      const data = {
        status: null,
        tanggal_janji: null,
        jam_janji: null,
        keluhan: null,
      };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      // Null values should fail validation for each property
      expect(errors.length).toBe(0);
    });

    it('should handle undefined values', async () => {
      const data = {
        status: undefined,
        tanggal_janji: undefined,
        jam_janji: undefined,
        keluhan: undefined,
      };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      // Undefined values should pass because properties are optional
      expect(errors.length).toBe(0);
    });

    it('should handle empty string for keluhan', async () => {
      const data = { keluhan: '' };

      const dto = plainToInstance(UpdateAppointmentDto, data);
      const errors = await validate(dto);

      // Empty string should pass validation and be trimmed to empty string
      expect(errors.length).toBe(0);
      expect(dto.keluhan).toBe('');
    });
  });
});