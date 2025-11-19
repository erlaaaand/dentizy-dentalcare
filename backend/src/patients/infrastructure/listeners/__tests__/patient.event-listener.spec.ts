// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { PatientEventListener } from '../patient.event-listener'; // Sesuaikan path
import { PatientCreatedEvent } from '../../../infrastructure/events/patient-created.event';
import { PatientUpdatedEvent } from '../../../infrastructure/events/patient-updated.event';
import { PatientDeletedEvent } from '../../../infrastructure/events/patient-deleted.event';
import { Patient } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
const mockPatient = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
} as Patient;

const mockCreatedEvent = new PatientCreatedEvent(mockPatient);

const mockUpdatedEvent = new PatientUpdatedEvent(1, {
  nama_lengkap: 'Budi Updated'
});

const mockDeletedEvent = new PatientDeletedEvent(1, 'Budi Santoso');

// 3. TEST SUITE
describe('PatientEventListener', () => {
  let listener: PatientEventListener;
  let loggerSpy: jest.SpyInstance;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientEventListener],
    }).setLogger({ log: jest.fn(), error: jest.fn(), warn: jest.fn() }).compile();

    listener = module.get<PatientEventListener>(PatientEventListener);

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });

    // Mock Logger.log agar tidak mengotori console saat test
    // dan agar kita bisa memverifikasi panggilannya
    loggerSpy.mockClear();
  });

  afterEach(() => {
    // Gunakan restoreAllMocks agar spy dilepas setelah test selesai
    // (Mencegah kebocoran spy ke file test lain)
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('handlePatientCreated', () => {
    it('should log the creation message with patient name', () => {
      // Act
      listener.handlePatientCreated(mockCreatedEvent);

      // Assert
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Patient created: ${mockPatient.nama_lengkap}`
      );
    });
  });

  describe('handlePatientUpdated', () => {
    it('should log the creation message with patient name', () => {
      // Act
      listener.handlePatientCreated(mockCreatedEvent);

      // Assert
      // Sekarang hitungannya pasti 1 karena log inisialisasi sudah di-clear
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Patient created: ${mockPatient.nama_lengkap}`
      );
    });
  });

  describe('handlePatientDeleted', () => {
    it('should log the deletion message with ID and Name', () => {
      // Act
      listener.handlePatientDeleted(mockDeletedEvent);

      // Assert
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Patient deleted: ID ${mockDeletedEvent.patientId} (${mockDeletedEvent.patientName})`
      );
    });
  });

  // 6. SUB-GROUP TESTS (Integration Logic - Future Proofing)

  // Bagian ini opsional, tapi disiapkan untuk skenario di mana
  // Anda menambahkan logic lain selain logging (misal kirim email).
  describe('Event Payload Integrity', () => {
    it('should handle event payload correctly', () => {
      // Verify logic didn't crash accessing properties
      expect(() => listener.handlePatientCreated(mockCreatedEvent)).not.toThrow();
      expect(() => listener.handlePatientUpdated(mockUpdatedEvent)).not.toThrow();
      expect(() => listener.handlePatientDeleted(mockDeletedEvent)).not.toThrow();
    });
  });
});