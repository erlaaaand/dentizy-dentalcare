import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAppointmentDto } from '../create-appointment.dto';
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('CreateAppointmentDto', () => {
  // Data dasar yang valid untuk digunakan di setiap tes
  const baseValidData = {
    patient_id: 1,
    doctor_id: 2,
    tanggal_janji: '2025-11-20',
    jam_janji: '09:30:00',
    keluhan: 'Gigi berlubang di bagian belakang',
  };

  // --- 1. Tes Skenario Sukses ---

  it('should pass validation with all properties valid', async () => {
    const dto = plainToInstance(CreateAppointmentDto, baseValidData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation when optional fields (keluhan, status) are missing', async () => {
    const { keluhan, ...dataTanpaKeluhan } = baseValidData;

    const dto = plainToInstance(CreateAppointmentDto, dataTanpaKeluhan);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  // --- 2. Tes Properti 'patient_id' ---

  describe('patient_id', () => {
    it('should fail if patient_id is missing', async () => {
      const { patient_id, ...dataTanpaPatientId } = baseValidData;

      const dto = plainToInstance(CreateAppointmentDto, dataTanpaPatientId);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const patientIdError = errors.find(
        (error) => error.property === 'patient_id',
      );
      expect(patientIdError?.constraints).toBeDefined();
      expect(patientIdError?.constraints?.isNotEmpty).toContain(
        'Patient ID harus diisi',
      );
    });

    it('should fail if patient_id is not a number', async () => {
      const data = { ...baseValidData, patient_id: '1' }; // Tipe string, bukan number

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const patientIdError = errors.find(
        (error) => error.property === 'patient_id',
      );
      expect(patientIdError?.constraints).toBeDefined();
      expect(patientIdError?.constraints?.isNumber).toBeDefined();
    });
  });

  // --- 3. Tes Properti 'doctor_id' ---

  describe('doctor_id', () => {
    it('should fail if doctor_id is missing', async () => {
      const { doctor_id, ...dataTanpaDoctorId } = baseValidData;

      const dto = plainToInstance(CreateAppointmentDto, dataTanpaDoctorId);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const doctorIdError = errors.find(
        (error) => error.property === 'doctor_id',
      );
      expect(doctorIdError?.constraints).toBeDefined();
      expect(doctorIdError?.constraints?.isNotEmpty).toContain(
        'Doctor ID harus diisi',
      );
    });

    it('should fail if doctor_id is not a number', async () => {
      const data = { ...baseValidData, doctor_id: 'abc' }; // Tipe string

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const doctorIdError = errors.find(
        (error) => error.property === 'doctor_id',
      );
      expect(doctorIdError?.constraints).toBeDefined();
      expect(doctorIdError?.constraints?.isNumber).toBeDefined();
    });
  });

  // --- 4. Tes Properti 'tanggal_janji' ---

  describe('tanggal_janji', () => {
    it('should fail if tanggal_janji is missing', async () => {
      const { tanggal_janji, ...dataTanpaTanggal } = baseValidData;

      const dto = plainToInstance(CreateAppointmentDto, dataTanpaTanggal);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const tanggalError = errors.find(
        (error) => error.property === 'tanggal_janji',
      );
      expect(tanggalError?.constraints).toBeDefined();
      expect(tanggalError?.constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail if tanggal_janji format is invalid (DD-MM-YYYY)', async () => {
      const data = { ...baseValidData, tanggal_janji: '20-11-2025' };

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const tanggalError = errors.find(
        (error) => error.property === 'tanggal_janji',
      );
      expect(tanggalError?.constraints).toBeDefined();
      expect(tanggalError?.constraints?.isDateString).toContain(
        'Format tanggal tidak valid',
      );
    });

    it('should fail if tanggal_janji is not a valid date', async () => {
      const data = { ...baseValidData, tanggal_janji: 'ini-bukan-tanggal' };

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const tanggalError = errors.find(
        (error) => error.property === 'tanggal_janji',
      );
      expect(tanggalError?.constraints).toBeDefined();
      expect(tanggalError?.constraints?.isDateString).toBeDefined();
    });
  });

  // --- 5. Tes Properti 'jam_janji' ---

  describe('jam_janji', () => {
    it('should fail if jam_janji is missing', async () => {
      const { jam_janji, ...dataTanpaJam } = baseValidData;

      const dto = plainToInstance(CreateAppointmentDto, dataTanpaJam);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const jamError = errors.find((error) => error.property === 'jam_janji');
      expect(jamError?.constraints).toBeDefined();
      expect(jamError?.constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail if jam_janji format is invalid (HH:mm)', async () => {
      const data = { ...baseValidData, jam_janji: '09:30' }; // Harus HH:mm:ss

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const jamError = errors.find((error) => error.property === 'jam_janji');
      expect(jamError?.constraints).toBeDefined();
      expect(jamError?.constraints?.matches).toContain(
        'Format jam tidak valid',
      );
    });

    it('should fail if jam_janji has invalid time (e.g., 25:00:00)', async () => {
      const data = { ...baseValidData, jam_janji: '25:00:00' };

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const jamError = errors.find((error) => error.property === 'jam_janji');
      expect(jamError?.constraints).toBeDefined();
      expect(jamError?.constraints?.matches).toBeDefined();
    });
  });

  // --- 6. Tes Properti Opsional ('status' dan 'keluhan') ---

  describe('status', () => {
    it('should pass if status is a valid enum value', async () => {
      const data = { ...baseValidData, status: AppointmentStatus.DIJADWALKAN };

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if status is not a valid enum value', async () => {
      const data = { ...baseValidData, status: 'MENUNGGU' }; // 'MENUNGGU' tidak ada di enum

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const statusError = errors.find((error) => error.property === 'status');
      expect(statusError?.constraints).toBeDefined();
      expect(statusError?.constraints?.isEnum).toBeDefined();
    });
  });

  describe('keluhan', () => {
    it('should fail if keluhan is longer than 1000 characters', async () => {
      const longText = 'a'.repeat(1001); // 1001 karakter
      const data = { ...baseValidData, keluhan: longText };

      const dto = plainToInstance(CreateAppointmentDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const keluhanError = errors.find((error) => error.property === 'keluhan');
      expect(keluhanError?.constraints).toBeDefined();
      expect(keluhanError?.constraints?.maxLength).toContain(
        'maksimal 1000 karakter',
      );
    });

    it('should trim whitespace from keluhan (@Transform)', () => {
      const data = { ...baseValidData, keluhan: '  Sakit gigi.  ' };

      const dto = plainToInstance(CreateAppointmentDto, data);

      // Tes transformasi tidak memerlukan 'validate',
      // kita cek langsung nilai propertinya
      expect(dto.keluhan).toBe('Sakit gigi.');
    });
  });
});
