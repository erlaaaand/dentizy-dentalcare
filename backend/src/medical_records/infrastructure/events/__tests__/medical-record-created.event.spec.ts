// ============================================================================
// IMPORTS
// ============================================================================
import { MedicalRecordCreatedEvent } from '../medical-record-created.event';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockEventData = {
  medicalRecordId: 1,
  appointmentId: 100,
  patientId: 200,
  doctorId: 300,
  createdBy: 300,
  timestamp: new Date('2024-01-15T10:00:00.000Z'),
  metadata: {
    hasSubjektif: true,
    hasObjektif: true,
    hasAssessment: true,
    hasPlan: true,
    isComplete: true,
  },
};

const mockIncompleteEventData = {
  medicalRecordId: 2,
  appointmentId: 101,
  patientId: 201,
  doctorId: 301,
  createdBy: 301,
  timestamp: new Date('2024-01-15T11:00:00.000Z'),
  metadata: {
    hasSubjektif: true,
    hasObjektif: false,
    hasAssessment: false,
    hasPlan: false,
    isComplete: false,
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordCreatedEvent', () => {
  // ============================================================================
  // SETUP AND TEARDOWN
  // ============================================================================
  beforeEach(() => {
    // No specific setup needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // BASIC TESTS
  // ============================================================================
  it('should be defined', () => {
    expect(MedicalRecordCreatedEvent).toBeDefined();
  });

  // ============================================================================
  // CONSTRUCTOR TESTS
  // ============================================================================
  describe('Constructor', () => {
    it('should create event with all required properties', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
        mockEventData.metadata,
      );

      expect(event.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(event.appointmentId).toBe(mockEventData.appointmentId);
      expect(event.patientId).toBe(mockEventData.patientId);
      expect(event.doctorId).toBe(mockEventData.doctorId);
      expect(event.createdBy).toBe(mockEventData.createdBy);
      expect(event.timestamp).toBe(mockEventData.timestamp);
      expect(event.metadata).toBe(mockEventData.metadata);
    });

    it('should create event with default timestamp if not provided', () => {
      const beforeCreate = new Date();
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
      );
      const afterCreate = new Date();

      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it('should create event without metadata', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
      );

      expect(event.metadata).toBeUndefined();
    });

    it('should store incomplete metadata correctly', () => {
      const event = new MedicalRecordCreatedEvent(
        mockIncompleteEventData.medicalRecordId,
        mockIncompleteEventData.appointmentId,
        mockIncompleteEventData.patientId,
        mockIncompleteEventData.doctorId,
        mockIncompleteEventData.createdBy,
        mockIncompleteEventData.timestamp,
        mockIncompleteEventData.metadata,
      );

      expect(event.metadata?.isComplete).toBe(false);
      expect(event.metadata?.hasSubjektif).toBe(true);
      expect(event.metadata?.hasObjektif).toBe(false);
    });
  });

  // ============================================================================
  // STATIC PROPERTY TESTS
  // ============================================================================
  describe('Static Properties', () => {
    it('should have correct event name', () => {
      expect(MedicalRecordCreatedEvent.eventName).toBe(
        'medical_record.created',
      );
    });

    it('should have correct event version', () => {
      expect(MedicalRecordCreatedEvent.eventVersion).toBe('1.0.0');
    });
  });

  // ============================================================================
  // TO JSON TESTS
  // ============================================================================
  describe('toJSON', () => {
    it('should serialize event to JSON with all properties', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
        mockEventData.metadata,
      );

      const json = event.toJSON();

      expect(json.eventName).toBe('medical_record.created');
      expect(json.eventVersion).toBe('1.0.0');
      expect(json.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(json.appointmentId).toBe(mockEventData.appointmentId);
      expect(json.patientId).toBe(mockEventData.patientId);
      expect(json.doctorId).toBe(mockEventData.doctorId);
      expect(json.createdBy).toBe(mockEventData.createdBy);
      expect(json.timestamp).toBe(mockEventData.timestamp.toISOString());
      expect(json.metadata).toEqual(mockEventData.metadata);
    });

    it('should serialize timestamp as ISO string', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
      );

      const json = event.toJSON();

      expect(json.timestamp).toBe('2024-01-15T10:00:00.000Z');
      expect(typeof json.timestamp).toBe('string');
    });

    it('should handle undefined metadata', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
      );

      const json = event.toJSON();

      expect(json.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // FROM JSON TESTS
  // ============================================================================
  describe('fromJSON', () => {
    it('should deserialize event from JSON', () => {
      const json = {
        eventName: 'medical_record.created',
        eventVersion: '1.0.0',
        medicalRecordId: mockEventData.medicalRecordId,
        appointmentId: mockEventData.appointmentId,
        patientId: mockEventData.patientId,
        doctorId: mockEventData.doctorId,
        createdBy: mockEventData.createdBy,
        timestamp: mockEventData.timestamp.toISOString(),
        metadata: mockEventData.metadata,
      };

      const event = MedicalRecordCreatedEvent.fromJSON(json);

      expect(event).toBeInstanceOf(MedicalRecordCreatedEvent);
      expect(event.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(event.appointmentId).toBe(mockEventData.appointmentId);
      expect(event.patientId).toBe(mockEventData.patientId);
      expect(event.doctorId).toBe(mockEventData.doctorId);
      expect(event.createdBy).toBe(mockEventData.createdBy);
      expect(event.timestamp).toEqual(mockEventData.timestamp);
      expect(event.metadata).toEqual(mockEventData.metadata);
    });

    it('should convert timestamp string to Date object', () => {
      const json = {
        medicalRecordId: 1,
        appointmentId: 100,
        patientId: 200,
        doctorId: 300,
        createdBy: 300,
        timestamp: '2024-01-15T10:00:00.000Z',
        metadata: mockEventData.metadata,
      };

      const event = MedicalRecordCreatedEvent.fromJSON(json);

      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.timestamp.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should handle undefined metadata', () => {
      const json = {
        medicalRecordId: 1,
        appointmentId: 100,
        patientId: 200,
        doctorId: 300,
        createdBy: 300,
        timestamp: '2024-01-15T10:00:00.000Z',
      };

      const event = MedicalRecordCreatedEvent.fromJSON(json);

      expect(event.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // GET DESCRIPTION TESTS
  // ============================================================================
  describe('getDescription', () => {
    it('should return human-readable description', () => {
      const event = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
        mockEventData.metadata,
      );

      const description = event.getDescription();

      expect(description).toContain('Medical record #1');
      expect(description).toContain('patient #200');
      expect(description).toContain('doctor #300');
      expect(description).toContain('created');
    });

    it('should include all relevant IDs in description', () => {
      const event = new MedicalRecordCreatedEvent(5, 10, 20, 30, 30);

      const description = event.getDescription();

      expect(description).toMatch(/Medical record #5/);
      expect(description).toMatch(/patient #20/);
      expect(description).toMatch(/doctor #30/);
    });
  });

  // ============================================================================
  // SERIALIZATION ROUND-TRIP TESTS
  // ============================================================================
  describe('Serialization Round-Trip', () => {
    it('should maintain data integrity through JSON round-trip', () => {
      const originalEvent = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
        mockEventData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordCreatedEvent.fromJSON(json);

      expect(reconstructedEvent.medicalRecordId).toBe(
        originalEvent.medicalRecordId,
      );
      expect(reconstructedEvent.appointmentId).toBe(
        originalEvent.appointmentId,
      );
      expect(reconstructedEvent.patientId).toBe(originalEvent.patientId);
      expect(reconstructedEvent.doctorId).toBe(originalEvent.doctorId);
      expect(reconstructedEvent.createdBy).toBe(originalEvent.createdBy);
      expect(reconstructedEvent.timestamp.toISOString()).toBe(
        originalEvent.timestamp.toISOString(),
      );
      expect(reconstructedEvent.metadata).toEqual(originalEvent.metadata);
    });

    it('should handle complete metadata in round-trip', () => {
      const originalEvent = new MedicalRecordCreatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.createdBy,
        mockEventData.timestamp,
        mockEventData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordCreatedEvent.fromJSON(json);

      expect(reconstructedEvent.metadata?.isComplete).toBe(true);
      expect(reconstructedEvent.metadata?.hasSubjektif).toBe(true);
      expect(reconstructedEvent.metadata?.hasObjektif).toBe(true);
      expect(reconstructedEvent.metadata?.hasAssessment).toBe(true);
      expect(reconstructedEvent.metadata?.hasPlan).toBe(true);
    });

    it('should handle incomplete metadata in round-trip', () => {
      const originalEvent = new MedicalRecordCreatedEvent(
        mockIncompleteEventData.medicalRecordId,
        mockIncompleteEventData.appointmentId,
        mockIncompleteEventData.patientId,
        mockIncompleteEventData.doctorId,
        mockIncompleteEventData.createdBy,
        mockIncompleteEventData.timestamp,
        mockIncompleteEventData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordCreatedEvent.fromJSON(json);

      expect(reconstructedEvent.metadata?.isComplete).toBe(false);
      expect(reconstructedEvent.metadata?.hasSubjektif).toBe(true);
      expect(reconstructedEvent.metadata?.hasObjektif).toBe(false);
    });
  });

  // ============================================================================
  // METADATA TESTS
  // ============================================================================
  describe('Metadata Handling', () => {
    it('should correctly represent complete record', () => {
      const event = new MedicalRecordCreatedEvent(
        1,
        100,
        200,
        300,
        300,
        new Date(),
        {
          hasSubjektif: true,
          hasObjektif: true,
          hasAssessment: true,
          hasPlan: true,
          isComplete: true,
        },
      );

      expect(event.metadata?.isComplete).toBe(true);
      expect(event.metadata?.hasSubjektif).toBe(true);
      expect(event.metadata?.hasObjektif).toBe(true);
      expect(event.metadata?.hasAssessment).toBe(true);
      expect(event.metadata?.hasPlan).toBe(true);
    });

    it('should correctly represent incomplete record', () => {
      const event = new MedicalRecordCreatedEvent(
        1,
        100,
        200,
        300,
        300,
        new Date(),
        {
          hasSubjektif: true,
          hasObjektif: false,
          hasAssessment: false,
          hasPlan: false,
          isComplete: false,
        },
      );

      expect(event.metadata?.isComplete).toBe(false);
    });

    it('should handle partial metadata', () => {
      const event = new MedicalRecordCreatedEvent(
        1,
        100,
        200,
        300,
        300,
        new Date(),
        {
          hasSubjektif: true,
          hasObjektif: true,
          hasAssessment: false,
          hasPlan: false,
          isComplete: false,
        },
      );

      expect(event.metadata?.hasSubjektif).toBe(true);
      expect(event.metadata?.hasObjektif).toBe(true);
      expect(event.metadata?.hasAssessment).toBe(false);
      expect(event.metadata?.hasPlan).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle zero IDs', () => {
      const event = new MedicalRecordCreatedEvent(0, 0, 0, 0, 0);

      expect(event.medicalRecordId).toBe(0);
      expect(event.appointmentId).toBe(0);
      expect(event.patientId).toBe(0);
      expect(event.doctorId).toBe(0);
      expect(event.createdBy).toBe(0);
    });

    it('should handle large IDs', () => {
      const largeId = 999999999;
      const event = new MedicalRecordCreatedEvent(
        largeId,
        largeId,
        largeId,
        largeId,
        largeId,
      );

      expect(event.medicalRecordId).toBe(largeId);
      expect(event.appointmentId).toBe(largeId);
    });

    it('should handle different timestamp formats', () => {
      const timestamp = new Date('2024-12-31T23:59:59.999Z');
      const event = new MedicalRecordCreatedEvent(
        1,
        100,
        200,
        300,
        300,
        timestamp,
      );

      const json = event.toJSON();
      const reconstructed = MedicalRecordCreatedEvent.fromJSON(json);

      expect(reconstructed.timestamp.toISOString()).toBe(
        timestamp.toISOString(),
      );
    });
  });
});
