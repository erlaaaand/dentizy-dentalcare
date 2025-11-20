// __tests__/infrastructure/events/patient-created.event.spec.ts

// 1. IMPORTS
import { PatientCreatedEvent } from '../../../infrastructure/events/patient-created.event';
import { Patient } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
const mockPatientData = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
  nik: '1234567890123456',
  created_at: new Date(),
} as Patient;

// 3. TEST SUITE
describe('PatientCreatedEvent', () => {
  
  // 4. SETUP AND TEARDOWN
  // Karena ini hanya instansiasi class sederhana (POJO), 
  // tidak diperlukan setup kompleks seperti Test.createTestingModule.

  // 5. EXECUTE METHOD TESTS (Constructor & Properties)

  it('should be defined', () => {
    const event = new PatientCreatedEvent(mockPatientData);
    expect(event).toBeDefined();
  });

  it('should hold the patient data passed in constructor', () => {
    // Act
    const event = new PatientCreatedEvent(mockPatientData);

    // Assert
    expect(event.patient).toEqual(mockPatientData);
    // Memastikan referensi objeknya sama (karena pass by reference)
    expect(event.patient).toBe(mockPatientData); 
  });

  // 6. SUB-GROUP TESTS (Immutability Check - Optional)
  
  describe('Immutability', () => {
    it('should have a accessible patient property', () => {
        const event = new PatientCreatedEvent(mockPatientData);
        expect(event.patient).toBeTruthy();
        expect(event.patient.id).toBe(1);
    });
  });
});