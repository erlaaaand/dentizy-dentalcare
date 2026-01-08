// ============================================================================
// IMPORTS
// ============================================================================
import { MedicalRecordUpdatedEvent } from '../medical-record-updated.event';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockEventData = {
  medicalRecordId: 1,
  appointmentId: 100,
  patientId: 200,
  doctorId: 300,
  updatedBy: 300,
  timestamp: new Date('2024-01-15T10:00:00.000Z'),
  changes: {
    subjektif: { old: 'Old subjektif', new: 'New subjektif' },
    objektif: { old: 'Old objektif', new: 'New objektif' },
  },
  metadata: {
    fieldsUpdated: ['subjektif', 'objektif'],
    isNowComplete: true,
    wasComplete: false,
  },
};

const mockCompleteEventData = {
  medicalRecordId: 2,
  appointmentId: 101,
  patientId: 201,
  doctorId: 301,
  updatedBy: 301,
  timestamp: new Date('2024-01-15T11:00:00.000Z'),
  changes: {
    subjektif: { old: 'Old text', new: 'New text' },
    objektif: { old: 'Old result', new: 'New result' },
    assessment: { old: 'Old diagnosis', new: 'New diagnosis' },
    plan: { old: 'Old plan', new: 'New plan' },
  },
  metadata: {
    fieldsUpdated: ['subjektif', 'objektif', 'assessment', 'plan'],
    isNowComplete: true,
    wasComplete: true,
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordUpdatedEvent', () => {
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
    expect(MedicalRecordUpdatedEvent).toBeDefined();
  });

  // ============================================================================
  // CONSTRUCTOR TESTS
  // ============================================================================
  describe('Constructor', () => {
    it('should create event with all required properties', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(event.appointmentId).toBe(mockEventData.appointmentId);
      expect(event.patientId).toBe(mockEventData.patientId);
      expect(event.doctorId).toBe(mockEventData.doctorId);
      expect(event.updatedBy).toBe(mockEventData.updatedBy);
      expect(event.timestamp).toBe(mockEventData.timestamp);
      expect(event.changes).toBe(mockEventData.changes);
      expect(event.metadata).toBe(mockEventData.metadata);
    });

    it('should create event with default timestamp if not provided', () => {
      const beforeCreate = new Date();
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
      );
      const afterCreate = new Date();

      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it('should create event without changes and metadata', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
      );

      expect(event.changes).toBeUndefined();
      expect(event.metadata).toBeUndefined();
    });

    it('should store all field changes correctly', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      expect(event.changes?.subjektif).toEqual({
        old: 'Old text',
        new: 'New text',
      });
      expect(event.changes?.objektif).toEqual({
        old: 'Old result',
        new: 'New result',
      });
      expect(event.changes?.assessment).toEqual({
        old: 'Old diagnosis',
        new: 'New diagnosis',
      });
      expect(event.changes?.plan).toEqual({
        old: 'Old plan',
        new: 'New plan',
      });
    });
  });

  // ============================================================================
  // STATIC PROPERTY TESTS
  // ============================================================================
  describe('Static Properties', () => {
    it('should have correct event name', () => {
      expect(MedicalRecordUpdatedEvent.eventName).toBe(
        'medical_record.updated',
      );
    });

    it('should have correct event version', () => {
      expect(MedicalRecordUpdatedEvent.eventVersion).toBe('1.0.0');
    });
  });

  // ============================================================================
  // TO JSON TESTS
  // ============================================================================
  describe('toJSON', () => {
    it('should serialize event to JSON with all properties', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      const json = event.toJSON();

      expect(json.eventName).toBe('medical_record.updated');
      expect(json.eventVersion).toBe('1.0.0');
      expect(json.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(json.appointmentId).toBe(mockEventData.appointmentId);
      expect(json.patientId).toBe(mockEventData.patientId);
      expect(json.doctorId).toBe(mockEventData.doctorId);
      expect(json.updatedBy).toBe(mockEventData.updatedBy);
      expect(json.timestamp).toBe(mockEventData.timestamp.toISOString());
      expect(json.changes).toEqual(mockEventData.changes);
      expect(json.metadata).toEqual(mockEventData.metadata);
    });

    it('should serialize timestamp as ISO string', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
      );

      const json = event.toJSON();

      expect(json.timestamp).toBe('2024-01-15T10:00:00.000Z');
      expect(typeof json.timestamp).toBe('string');
    });

    it('should handle undefined changes and metadata', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
      );

      const json = event.toJSON();

      expect(json.changes).toBeUndefined();
      expect(json.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // FROM JSON TESTS
  // ============================================================================
  describe('fromJSON', () => {
    it('should deserialize event from JSON', () => {
      const json = {
        eventName: 'medical_record.updated',
        eventVersion: '1.0.0',
        medicalRecordId: mockEventData.medicalRecordId,
        appointmentId: mockEventData.appointmentId,
        patientId: mockEventData.patientId,
        doctorId: mockEventData.doctorId,
        updatedBy: mockEventData.updatedBy,
        timestamp: mockEventData.timestamp.toISOString(),
        changes: mockEventData.changes,
        metadata: mockEventData.metadata,
      };

      const event = MedicalRecordUpdatedEvent.fromJSON(json);

      expect(event).toBeInstanceOf(MedicalRecordUpdatedEvent);
      expect(event.medicalRecordId).toBe(mockEventData.medicalRecordId);
      expect(event.appointmentId).toBe(mockEventData.appointmentId);
      expect(event.patientId).toBe(mockEventData.patientId);
      expect(event.doctorId).toBe(mockEventData.doctorId);
      expect(event.updatedBy).toBe(mockEventData.updatedBy);
      expect(event.timestamp).toEqual(mockEventData.timestamp);
      expect(event.changes).toEqual(mockEventData.changes);
      expect(event.metadata).toEqual(mockEventData.metadata);
    });

    it('should convert timestamp string to Date object', () => {
      const json = {
        medicalRecordId: 1,
        appointmentId: 100,
        patientId: 200,
        doctorId: 300,
        updatedBy: 300,
        timestamp: '2024-01-15T10:00:00.000Z',
        changes: mockEventData.changes,
        metadata: mockEventData.metadata,
      };

      const event = MedicalRecordUpdatedEvent.fromJSON(json);

      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.timestamp.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should handle undefined changes and metadata', () => {
      const json = {
        medicalRecordId: 1,
        appointmentId: 100,
        patientId: 200,
        doctorId: 300,
        updatedBy: 300,
        timestamp: '2024-01-15T10:00:00.000Z',
      };

      const event = MedicalRecordUpdatedEvent.fromJSON(json);

      expect(event.changes).toBeUndefined();
      expect(event.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // GET DESCRIPTION TESTS
  // ============================================================================
  describe('getDescription', () => {
    it('should return human-readable description with fields', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      const description = event.getDescription();

      expect(description).toContain('Medical record #1');
      expect(description).toContain('user #300');
      expect(description).toContain('subjektif, objektif');
      expect(description).toContain('Updated fields');
    });

    it('should handle unknown fields', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
      );

      const description = event.getDescription();

      expect(description).toContain('unknown fields');
    });

    it('should list all updated fields', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      const description = event.getDescription();

      expect(description).toContain('subjektif, objektif, assessment, plan');
    });
  });

  // ============================================================================
  // WAS FIELD UPDATED TESTS
  // ============================================================================
  describe('wasFieldUpdated', () => {
    it('should return true for updated field', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.wasFieldUpdated('subjektif')).toBe(true);
      expect(event.wasFieldUpdated('objektif')).toBe(true);
    });

    it('should return false for non-updated field', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.wasFieldUpdated('assessment')).toBe(false);
      expect(event.wasFieldUpdated('plan')).toBe(false);
    });

    it('should return false when metadata is undefined', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
      );

      expect(event.wasFieldUpdated('subjektif')).toBe(false);
    });

    it('should handle all SOAP fields', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      expect(event.wasFieldUpdated('subjektif')).toBe(true);
      expect(event.wasFieldUpdated('objektif')).toBe(true);
      expect(event.wasFieldUpdated('assessment')).toBe(true);
      expect(event.wasFieldUpdated('plan')).toBe(true);
    });
  });

  // ============================================================================
  // GET UPDATED FIELDS COUNT TESTS
  // ============================================================================
  describe('getUpdatedFieldsCount', () => {
    it('should return correct count for partial update', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.getUpdatedFieldsCount()).toBe(2);
    });

    it('should return correct count for complete update', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      expect(event.getUpdatedFieldsCount()).toBe(4);
    });

    it('should return 0 when metadata is undefined', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
      );

      expect(event.getUpdatedFieldsCount()).toBe(0);
    });

    it('should return 0 when fieldsUpdated is empty', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        { ...mockEventData.metadata, fieldsUpdated: [] },
      );

      expect(event.getUpdatedFieldsCount()).toBe(0);
    });
  });

  // ============================================================================
  // SERIALIZATION ROUND-TRIP TESTS
  // ============================================================================
  describe('Serialization Round-Trip', () => {
    it('should maintain data integrity through JSON round-trip', () => {
      const originalEvent = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordUpdatedEvent.fromJSON(json);

      expect(reconstructedEvent.medicalRecordId).toBe(
        originalEvent.medicalRecordId,
      );
      expect(reconstructedEvent.appointmentId).toBe(
        originalEvent.appointmentId,
      );
      expect(reconstructedEvent.patientId).toBe(originalEvent.patientId);
      expect(reconstructedEvent.doctorId).toBe(originalEvent.doctorId);
      expect(reconstructedEvent.updatedBy).toBe(originalEvent.updatedBy);
      expect(reconstructedEvent.timestamp.toISOString()).toBe(
        originalEvent.timestamp.toISOString(),
      );
      expect(reconstructedEvent.changes).toEqual(originalEvent.changes);
      expect(reconstructedEvent.metadata).toEqual(originalEvent.metadata);
    });

    it('should preserve all change details', () => {
      const originalEvent = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordUpdatedEvent.fromJSON(json);

      expect(reconstructedEvent.changes?.subjektif).toEqual(
        mockCompleteEventData.changes.subjektif,
      );
      expect(reconstructedEvent.changes?.objektif).toEqual(
        mockCompleteEventData.changes.objektif,
      );
      expect(reconstructedEvent.changes?.assessment).toEqual(
        mockCompleteEventData.changes.assessment,
      );
      expect(reconstructedEvent.changes?.plan).toEqual(
        mockCompleteEventData.changes.plan,
      );
    });
  });

  // ============================================================================
  // METADATA TESTS
  // ============================================================================
  describe('Metadata Handling', () => {
    it('should track completion status change', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.metadata?.wasComplete).toBe(false);
      expect(event.metadata?.isNowComplete).toBe(true);
    });

    it('should track fields that were updated', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockEventData.medicalRecordId,
        mockEventData.appointmentId,
        mockEventData.patientId,
        mockEventData.doctorId,
        mockEventData.updatedBy,
        mockEventData.timestamp,
        mockEventData.changes,
        mockEventData.metadata,
      );

      expect(event.metadata?.fieldsUpdated).toEqual(['subjektif', 'objektif']);
    });

    it('should handle record that stays complete', () => {
      const event = new MedicalRecordUpdatedEvent(
        mockCompleteEventData.medicalRecordId,
        mockCompleteEventData.appointmentId,
        mockCompleteEventData.patientId,
        mockCompleteEventData.doctorId,
        mockCompleteEventData.updatedBy,
        mockCompleteEventData.timestamp,
        mockCompleteEventData.changes,
        mockCompleteEventData.metadata,
      );

      expect(event.metadata?.wasComplete).toBe(true);
      expect(event.metadata?.isNowComplete).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle single field update', () => {
      const event = new MedicalRecordUpdatedEvent(
        1,
        100,
        200,
        300,
        300,
        new Date(),
        { subjektif: { old: 'Old', new: 'New' } },
        {
          fieldsUpdated: ['subjektif'],
          isNowComplete: false,
          wasComplete: false,
        },
      );

      expect(event.getUpdatedFieldsCount()).toBe(1);
      expect(event.wasFieldUpdated('subjektif')).toBe(true);
    });

    it('should handle empty change values', () => {
      const event = new MedicalRecordUpdatedEvent(
        1,
        100,
        200,
        300,
        300,
        new Date(),
        { subjektif: { old: 'Old value', new: '' } },
        {
          fieldsUpdated: ['subjektif'],
          isNowComplete: false,
          wasComplete: true,
        },
      );

      expect(event.changes?.subjektif?.new).toBe('');
    });

    it('should handle zero IDs', () => {
      const event = new MedicalRecordUpdatedEvent(0, 0, 0, 0, 0);

      expect(event.medicalRecordId).toBe(0);
      expect(event.updatedBy).toBe(0);
    });
  });
});
