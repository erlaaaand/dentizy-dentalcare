// ============================================================================
// IMPORTS
// ============================================================================
import { MedicalRecordDeletedEvent } from '../medical-record-deleted.event';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockSoftDeleteData = {
  medicalRecordId: 1,
  appointmentId: 100,
  patientId: 200,
  doctorId: 300,
  deletedBy: 400,
  timestamp: new Date('2024-01-15T10:00:00.000Z'),
  deletionType: 'soft' as const,
  reason: 'Kesalahan input data',
  metadata: {
    recordAge: 5,
    wasComplete: true,
    appointmentStatus: AppointmentStatus.SELESAI,
  },
};

const mockHardDeleteData = {
  medicalRecordId: 2,
  appointmentId: 101,
  patientId: 201,
  doctorId: 301,
  deletedBy: 401,
  timestamp: new Date('2024-01-15T11:00:00.000Z'),
  deletionType: 'hard' as const,
  reason: 'Data tidak valid',
  metadata: {
    recordAge: 30,
    wasComplete: false,
    appointmentStatus: AppointmentStatus.DIBATALKAN,
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordDeletedEvent', () => {
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
    expect(MedicalRecordDeletedEvent).toBeDefined();
  });

  // ============================================================================
  // CONSTRUCTOR TESTS
  // ============================================================================
  describe('Constructor', () => {
    it('should create event with all required properties', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      expect(event.medicalRecordId).toBe(mockSoftDeleteData.medicalRecordId);
      expect(event.appointmentId).toBe(mockSoftDeleteData.appointmentId);
      expect(event.patientId).toBe(mockSoftDeleteData.patientId);
      expect(event.doctorId).toBe(mockSoftDeleteData.doctorId);
      expect(event.deletedBy).toBe(mockSoftDeleteData.deletedBy);
      expect(event.timestamp).toBe(mockSoftDeleteData.timestamp);
      expect(event.deletionType).toBe(mockSoftDeleteData.deletionType);
      expect(event.reason).toBe(mockSoftDeleteData.reason);
      expect(event.metadata).toBe(mockSoftDeleteData.metadata);
    });

    it('should create event with default timestamp if not provided', () => {
      const beforeCreate = new Date();
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
      );
      const afterCreate = new Date();

      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it('should default to soft deletion type', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
      );

      expect(event.deletionType).toBe('soft');
    });

    it('should create hard delete event', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        mockHardDeleteData.deletionType,
        mockHardDeleteData.reason,
        mockHardDeleteData.metadata,
      );

      expect(event.deletionType).toBe('hard');
    });

    it('should create event without reason and metadata', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
      );

      expect(event.reason).toBeUndefined();
      expect(event.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // STATIC PROPERTY TESTS
  // ============================================================================
  describe('Static Properties', () => {
    it('should have correct event name', () => {
      expect(MedicalRecordDeletedEvent.eventName).toBe(
        'medical_record.deleted',
      );
    });

    it('should have correct event version', () => {
      expect(MedicalRecordDeletedEvent.eventVersion).toBe('1.0.0');
    });
  });

  // ============================================================================
  // TO JSON TESTS
  // ============================================================================
  describe('toJSON', () => {
    it('should serialize soft delete event to JSON', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      const json = event.toJSON();

      expect(json.eventName).toBe('medical_record.deleted');
      expect(json.eventVersion).toBe('1.0.0');
      expect(json.medicalRecordId).toBe(mockSoftDeleteData.medicalRecordId);
      expect(json.deletionType).toBe('soft');
      expect(json.reason).toBe(mockSoftDeleteData.reason);
      expect(json.metadata).toEqual(mockSoftDeleteData.metadata);
    });

    it('should serialize hard delete event to JSON', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        mockHardDeleteData.deletionType,
        mockHardDeleteData.reason,
        mockHardDeleteData.metadata,
      );

      const json = event.toJSON();

      expect(json.deletionType).toBe('hard');
    });

    it('should serialize timestamp as ISO string', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
      );

      const json = event.toJSON();

      expect(json.timestamp).toBe('2024-01-15T10:00:00.000Z');
      expect(typeof json.timestamp).toBe('string');
    });

    it('should handle undefined reason and metadata', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
      );

      const json = event.toJSON();

      expect(json.reason).toBeUndefined();
      expect(json.metadata).toBeUndefined();
    });
  });

  // ============================================================================
  // FROM JSON TESTS
  // ============================================================================
  describe('fromJSON', () => {
    it('should deserialize soft delete event from JSON', () => {
      const json = {
        eventName: 'medical_record.deleted',
        eventVersion: '1.0.0',
        medicalRecordId: mockSoftDeleteData.medicalRecordId,
        appointmentId: mockSoftDeleteData.appointmentId,
        patientId: mockSoftDeleteData.patientId,
        doctorId: mockSoftDeleteData.doctorId,
        deletedBy: mockSoftDeleteData.deletedBy,
        timestamp: mockSoftDeleteData.timestamp.toISOString(),
        deletionType: mockSoftDeleteData.deletionType,
        reason: mockSoftDeleteData.reason,
        metadata: mockSoftDeleteData.metadata,
      };

      const event = MedicalRecordDeletedEvent.fromJSON(json);

      expect(event).toBeInstanceOf(MedicalRecordDeletedEvent);
      expect(event.medicalRecordId).toBe(mockSoftDeleteData.medicalRecordId);
      expect(event.deletionType).toBe('soft');
      expect(event.reason).toBe(mockSoftDeleteData.reason);
    });

    it('should deserialize hard delete event from JSON', () => {
      const json = {
        medicalRecordId: mockHardDeleteData.medicalRecordId,
        appointmentId: mockHardDeleteData.appointmentId,
        patientId: mockHardDeleteData.patientId,
        doctorId: mockHardDeleteData.doctorId,
        deletedBy: mockHardDeleteData.deletedBy,
        timestamp: mockHardDeleteData.timestamp.toISOString(),
        deletionType: mockHardDeleteData.deletionType,
        reason: mockHardDeleteData.reason,
        metadata: mockHardDeleteData.metadata,
      };

      const event = MedicalRecordDeletedEvent.fromJSON(json);

      expect(event.deletionType).toBe('hard');
    });

    it('should convert timestamp string to Date object', () => {
      const json = {
        medicalRecordId: 1,
        appointmentId: 100,
        patientId: 200,
        doctorId: 300,
        deletedBy: 400,
        timestamp: '2024-01-15T10:00:00.000Z',
        deletionType: 'soft' as const,
      };

      const event = MedicalRecordDeletedEvent.fromJSON(json);

      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.timestamp.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  // ============================================================================
  // GET DESCRIPTION TESTS
  // ============================================================================
  describe('getDescription', () => {
    it('should return description for soft delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      const description = event.getDescription();

      expect(description).toContain('Medical record #1');
      expect(description).toContain('deleted');
      expect(description).not.toContain('permanently');
      expect(description).toContain('user #400');
      expect(description).toContain('Reason: Kesalahan input data');
    });

    it('should return description for hard delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        mockHardDeleteData.deletionType,
        mockHardDeleteData.reason,
        mockHardDeleteData.metadata,
      );

      const description = event.getDescription();

      expect(description).toContain('permanently deleted');
    });

    it('should handle description without reason', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
      );

      const description = event.getDescription();

      expect(description).not.toContain('Reason:');
    });
  });

  // ============================================================================
  // IS PERMANENT TESTS
  // ============================================================================
  describe('isPermanent', () => {
    it('should return true for hard delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        'hard',
      );

      expect(event.isPermanent()).toBe(true);
    });

    it('should return false for soft delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        'soft',
      );

      expect(event.isPermanent()).toBe(false);
    });

    it('should return false for default deletion type', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
      );

      expect(event.isPermanent()).toBe(false);
    });
  });

  // ============================================================================
  // IS RESTORABLE TESTS
  // ============================================================================
  describe('isRestorable', () => {
    it('should return true for soft delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        'soft',
      );

      expect(event.isRestorable()).toBe(true);
    });

    it('should return false for hard delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        'hard',
      );

      expect(event.isRestorable()).toBe(false);
    });
  });

  // ============================================================================
  // GET SEVERITY TESTS
  // ============================================================================
  describe('getSeverity', () => {
    it('should return critical for hard delete', () => {
      const event = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        'hard',
        mockHardDeleteData.reason,
        mockHardDeleteData.metadata,
      );

      expect(event.getSeverity()).toBe('critical');
    });

    it('should return warning for soft delete of complete record', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        'soft',
        mockSoftDeleteData.reason,
        {
          recordAge: 5,
          wasComplete: true,
          appointmentStatus: AppointmentStatus.SELESAI,
        },
      );

      expect(event.getSeverity()).toBe('warning');
    });

    it('should return info for soft delete of incomplete record', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        'soft',
        mockSoftDeleteData.reason,
        {
          recordAge: 5,
          wasComplete: false,
          appointmentStatus: AppointmentStatus.SELESAI,
        },
      );

      expect(event.getSeverity()).toBe('info');
    });

    it('should return info when metadata is undefined', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        'soft',
      );

      expect(event.getSeverity()).toBe('info');
    });
  });

  // ============================================================================
  // SERIALIZATION ROUND-TRIP TESTS
  // ============================================================================
  describe('Serialization Round-Trip', () => {
    it('should maintain data integrity for soft delete', () => {
      const originalEvent = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordDeletedEvent.fromJSON(json);

      expect(reconstructedEvent.medicalRecordId).toBe(
        originalEvent.medicalRecordId,
      );
      expect(reconstructedEvent.deletionType).toBe(originalEvent.deletionType);
      expect(reconstructedEvent.reason).toBe(originalEvent.reason);
      expect(reconstructedEvent.metadata).toEqual(originalEvent.metadata);
    });

    it('should maintain data integrity for hard delete', () => {
      const originalEvent = new MedicalRecordDeletedEvent(
        mockHardDeleteData.medicalRecordId,
        mockHardDeleteData.appointmentId,
        mockHardDeleteData.patientId,
        mockHardDeleteData.doctorId,
        mockHardDeleteData.deletedBy,
        mockHardDeleteData.timestamp,
        mockHardDeleteData.deletionType,
        mockHardDeleteData.reason,
        mockHardDeleteData.metadata,
      );

      const json = originalEvent.toJSON();
      const reconstructedEvent = MedicalRecordDeletedEvent.fromJSON(json);

      expect(reconstructedEvent.isPermanent()).toBe(true);
      expect(reconstructedEvent.isRestorable()).toBe(false);
      expect(reconstructedEvent.getSeverity()).toBe('critical');
    });
  });

  // ============================================================================
  // METADATA TESTS
  // ============================================================================
  describe('Metadata Handling', () => {
    it('should store record age correctly', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      expect(event.metadata?.recordAge).toBe(5);
    });

    it('should store completion status correctly', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      expect(event.metadata?.wasComplete).toBe(true);
    });

    it('should store appointment status correctly', () => {
      const event = new MedicalRecordDeletedEvent(
        mockSoftDeleteData.medicalRecordId,
        mockSoftDeleteData.appointmentId,
        mockSoftDeleteData.patientId,
        mockSoftDeleteData.doctorId,
        mockSoftDeleteData.deletedBy,
        mockSoftDeleteData.timestamp,
        mockSoftDeleteData.deletionType,
        mockSoftDeleteData.reason,
        mockSoftDeleteData.metadata,
      );

      expect(event.metadata?.appointmentStatus).toBe(AppointmentStatus.SELESAI);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle zero IDs', () => {
      const event = new MedicalRecordDeletedEvent(0, 0, 0, 0, 0);

      expect(event.medicalRecordId).toBe(0);
      expect(event.deletedBy).toBe(0);
    });

    it('should handle empty reason string', () => {
      const event = new MedicalRecordDeletedEvent(
        1,
        100,
        200,
        300,
        400,
        new Date(),
        'soft',
        '',
      );

      expect(event.reason).toBe('');
      const description = event.getDescription();
      expect(description).not.toContain('Reason: ');
    });

    it('should handle very old records', () => {
      const event = new MedicalRecordDeletedEvent(
        1,
        100,
        200,
        300,
        400,
        new Date(),
        'soft',
        'Too old',
        {
          recordAge: 365,
          wasComplete: true,
          appointmentStatus: AppointmentStatus.SELESAI,
        },
      );

      expect(event.metadata?.recordAge).toBe(365);
    });

    it('should handle cancelled appointment status', () => {
      const event = new MedicalRecordDeletedEvent(
        1,
        100,
        200,
        300,
        400,
        new Date(),
        'soft',
        'Cancelled appointment',
        {
          recordAge: 1,
          wasComplete: false,
          appointmentStatus: AppointmentStatus.DIBATALKAN,
        },
      );

      expect(event.metadata?.appointmentStatus).toBe(
        AppointmentStatus.DIBATALKAN,
      );
    });
  });
});
