// __tests__/infrastructure/events/patient-deleted.event.spec.ts

// 1. IMPORTS
import { PatientDeletedEvent } from '../../../infrastructure/events/patient-deleted.event';

// 2. MOCK DATA
const mockPatientId = 99;
const mockPatientName = 'Mantan Pasien';

// 3. TEST SUITE
describe('PatientDeletedEvent', () => {

  // 4. SETUP AND TEARDOWN
  // Class ini adalah POJO (Plain Old Java Object), tidak butuh DI/TestingModule.
  // Setup dilakukan langsung di dalam test case.

  // 5. EXECUTE METHOD TESTS (Constructor)

  it('should be defined', () => {
    const event = new PatientDeletedEvent(mockPatientId, mockPatientName);
    expect(event).toBeDefined();
  });

  it('should correctly assign patientId and patientName from constructor', () => {
    // Act
    const event = new PatientDeletedEvent(mockPatientId, mockPatientName);

    // Assert
    expect(event.patientId).toBe(mockPatientId);
    expect(event.patientName).toBe(mockPatientName);
  });

  // 6. SUB-GROUP TESTS (Data Integrity)

  describe('Data Integrity', () => {
    it('should handle empty string for patientName', () => {
      const event = new PatientDeletedEvent(1, '');
      expect(event.patientName).toBe('');
    });

    it('should handle negative numbers for patientId (if applicable)', () => {
      // Meskipun ID biasanya positif, event object hanya bertugas membawa data
      const event = new PatientDeletedEvent(-5, 'Test');
      expect(event.patientId).toBe(-5);
    });

    it('should be compatible with event emitter payload structure', () => {
      const event = new PatientDeletedEvent(mockPatientId, mockPatientName);

      // Memastikan objek bisa diserialisasi (penting jika event dikirim ke message broker/log)
      const serialized = JSON.parse(JSON.stringify(event));
      expect(serialized).toEqual({
        patientId: mockPatientId,
        patientName: mockPatientName
      });
    });
  });
});