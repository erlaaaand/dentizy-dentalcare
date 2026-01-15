// __tests__/infrastructure/events/patient-updated.event.spec.ts

// 1. IMPORTS
import { PatientUpdatedEvent } from '../../../infrastructure/events/patient-updated.event';
import { UpdatePatientDto } from '../../../application/dto/update-patient.dto';

// 2. MOCK DATA
const mockPatientId = 50;

// Skenario 1: Perubahan Multiple Field
const mockChangesMultiple: Partial<UpdatePatientDto> = {
  nama_lengkap: 'Budi Santoso Update',
  no_hp: '081299998888',
  is_active: false,
};

// Skenario 2: Perubahan Single Field (Partial)
const mockChangesSingle: Partial<UpdatePatientDto> = {
  email: 'new.email@example.com',
};

// 3. TEST SUITE
describe('PatientUpdatedEvent', () => {
  // 4. SETUP AND TEARDOWN
  // Class ini adalah POJO sederhana, setup dilakukan langsung di dalam test case.

  // 5. EXECUTE METHOD TESTS (Constructor)

  it('should be defined', () => {
    const event = new PatientUpdatedEvent(mockPatientId, mockChangesMultiple);
    expect(event).toBeDefined();
  });

  it('should correctly assign patientId and changes payload', () => {
    // Act
    const event = new PatientUpdatedEvent(mockPatientId, mockChangesMultiple);

    // Assert
    expect(event.patientId).toBe(mockPatientId);
    expect(event.changes).toEqual(mockChangesMultiple);

    // Deep equality check for object
    expect(event.changes.nama_lengkap).toBe('Budi Santoso Update');
    expect(event.changes.is_active).toBe(false);
  });

  // 6. SUB-GROUP TESTS (Data Integrity & Types)

  describe('Payload Handling', () => {
    it('should handle sparse/partial updates correctly', () => {
      // Act
      const event = new PatientUpdatedEvent(mockPatientId, mockChangesSingle);

      // Assert
      expect(event.changes).toEqual(mockChangesSingle);
      expect(event.changes.nama_lengkap).toBeUndefined(); // Field lain harus undefined
      expect(event.changes.email).toBeDefined();
    });

    it('should handle empty changes object (e.g. update triggered but no actual change)', () => {
      // Act
      const event = new PatientUpdatedEvent(mockPatientId, {});

      // Assert
      expect(event.changes).toEqual({});
      expect(Object.keys(event.changes).length).toBe(0);
    });

    it('should maintain referential integrity of the changes object', () => {
      // Act
      const event = new PatientUpdatedEvent(mockPatientId, mockChangesMultiple);

      // Assert
      // Memastikan objek yang disimpan adalah objek yang sama (penting untuk memory efficiency)
      expect(event.changes).toBe(mockChangesMultiple);
    });
  });
});
