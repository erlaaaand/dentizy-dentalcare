import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MedicalRecordEventListener } from '../medical-record.event-listener';
import { MedicalRecordCreatedEvent } from '../../events/medical-record-created.event';
import { MedicalRecordUpdatedEvent } from '../../events/medical-record-updated.event';
import { MedicalRecordDeletedEvent } from '../../events/medical-record-deleted.event';

describe('MedicalRecordEventListener', () => {
  let listener: MedicalRecordEventListener;

  // ==================== MOCK DATA ====================
  const mockCreatedEvent: MedicalRecordCreatedEvent = new MedicalRecordCreatedEvent(
    1,
    1,
    1,
    1,
    1,
    new Date(),
    {
      hasSubjektif: true,
      hasObjektif: true,
      hasAssessment: true,
      hasPlan: true,
      isComplete: true,
    },
  );

  const mockUpdatedEvent: MedicalRecordUpdatedEvent = new MedicalRecordUpdatedEvent(
    1,
    1,
    1,
    1,
    1,
    new Date(),
    {
      subjektif: { old: 'Old', new: 'New' },
    },
    {
      fieldsUpdated: ['subjektif'],
      isNowComplete: true,
      wasComplete: false,
    },
  );

  const mockDeletedEvent: MedicalRecordDeletedEvent = new MedicalRecordDeletedEvent(
    1,
    1,
    1,
    1,
    1,
    new Date(),
    'soft',
    'Test deletion',
    {
      recordAge: 10,
      wasComplete: true,
      appointmentStatus: 'SELESAI',
    },
  );

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordEventListener],
    }).compile();

    listener = module.get<MedicalRecordEventListener>(MedicalRecordEventListener);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HANDLE CREATED EVENT TESTS ====================
  describe('handleMedicalRecordCreated', () => {
    it('should handle created event successfully', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await listener.handleMedicalRecordCreated(mockCreatedEvent);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log complete record message', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await listener.handleMedicalRecordCreated(mockCreatedEvent);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('complete'),
      );
    });

    it('should log incomplete record warning', async () => {
      const incompleteEvent = new MedicalRecordCreatedEvent(
        1, 1, 1, 1, 1,
        new Date(),
        {
          hasSubjektif: true,
          hasObjektif: false,
          hasAssessment: false,
          hasPlan: false,
          isComplete: false,
        },
      );

      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await listener.handleMedicalRecordCreated(incompleteEvent);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('incomplete'),
      );
    });

    it('should handle errors gracefully', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      jest.spyOn(listener as any, 'logAuditTrail').mockRejectedValue(
        new Error('Audit failed'),
      );

      await listener.handleMedicalRecordCreated(mockCreatedEvent);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should call private methods', async () => {
      const logAuditSpy = jest.spyOn(listener as any, 'logAuditTrail').mockResolvedValue(undefined);
      const sendNotificationSpy = jest.spyOn(listener as any, 'sendNotification').mockResolvedValue(undefined);
      const updateStatsSpy = jest.spyOn(listener as any, 'updateStatistics').mockResolvedValue(undefined);
      const triggerIntegrationsSpy = jest.spyOn(listener as any, 'triggerIntegrations').mockResolvedValue(undefined);

      await listener.handleMedicalRecordCreated(mockCreatedEvent);

      expect(logAuditSpy).toHaveBeenCalled();
      expect(sendNotificationSpy).toHaveBeenCalled();
      expect(updateStatsSpy).toHaveBeenCalled();
      expect(triggerIntegrationsSpy).toHaveBeenCalled();
    });
  });

  // ==================== HANDLE UPDATED EVENT TESTS ====================
  describe('handleMedicalRecordUpdated', () => {
    it('should handle updated event successfully', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await listener.handleMedicalRecordUpdated(mockUpdatedEvent);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log when record becomes complete', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await listener.handleMedicalRecordUpdated(mockUpdatedEvent);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('now complete'),
      );
    });

    it('should not log completion if already complete', async () => {
      const alreadyCompleteEvent = new MedicalRecordUpdatedEvent(
        1, 1, 1, 1, 1,
        new Date(),
        {},
        {
          fieldsUpdated: ['subjektif'],
          isNowComplete: true,
          wasComplete: true,
        },
      );

      const handleCompletedSpy = jest.spyOn(
        listener as any,
        'handleRecordCompleted',
      ).mockResolvedValue(undefined);

      await listener.handleMedicalRecordUpdated(alreadyCompleteEvent);

      expect(handleCompletedSpy).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      jest.spyOn(listener as any, 'logAuditTrail').mockRejectedValue(
        new Error('Audit failed'),
      );

      await listener.handleMedicalRecordUpdated(mockUpdatedEvent);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should call private methods', async () => {
      const logAuditSpy = jest.spyOn(listener as any, 'logAuditTrail').mockResolvedValue(undefined);
      const sendNotificationSpy = jest.spyOn(listener as any, 'sendUpdateNotification').mockResolvedValue(undefined);
      const invalidateCacheSpy = jest.spyOn(listener as any, 'invalidateCache').mockResolvedValue(undefined);

      await listener.handleMedicalRecordUpdated(mockUpdatedEvent);

      expect(logAuditSpy).toHaveBeenCalled();
      expect(sendNotificationSpy).toHaveBeenCalled();
      expect(invalidateCacheSpy).toHaveBeenCalled();
    });
  });

  // ==================== HANDLE DELETED EVENT TESTS ====================
  describe('handleMedicalRecordDeleted', () => {
    it('should handle soft delete event', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await listener.handleMedicalRecordDeleted(mockDeletedEvent);

      expect(warnSpy).toHaveBeenCalled();
    });

    it('should handle hard delete event with critical logging', async () => {
      const hardDeleteEvent = new MedicalRecordDeletedEvent(
        1, 1, 1, 1, 1,
        new Date(),
        'hard',
        'Permanent deletion',
      );

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await listener.handleMedicalRecordDeleted(hardDeleteEvent);

      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('PERMANENT DELETION'),
      );
    });

    it('should archive before permanent deletion', async () => {
      const hardDeleteEvent = new MedicalRecordDeletedEvent(
        1, 1, 1, 1, 1,
        new Date(),
        'hard',
      );

      const archiveSpy = jest.spyOn(
        listener as any,
        'archiveBeforePermanentDeletion',
      ).mockResolvedValue(undefined);

      await listener.handleMedicalRecordDeleted(hardDeleteEvent);

      expect(archiveSpy).toHaveBeenCalled();
    });

    it('should not archive for soft delete', async () => {
      const archiveSpy = jest.spyOn(
        listener as any,
        'archiveBeforePermanentDeletion',
      ).mockResolvedValue(undefined);

      await listener.handleMedicalRecordDeleted(mockDeletedEvent);

      expect(archiveSpy).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      jest.spyOn(listener as any, 'logAuditTrail').mockRejectedValue(
        new Error('Audit failed'),
      );

      await listener.handleMedicalRecordDeleted(mockDeletedEvent);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should call private methods', async () => {
      const logAuditSpy = jest.spyOn(listener as any, 'logAuditTrail').mockResolvedValue(undefined);
      const sendNotificationSpy = jest.spyOn(listener as any, 'sendDeletionNotification').mockResolvedValue(undefined);
      const updateStatsSpy = jest.spyOn(listener as any, 'updateDeletionStatistics').mockResolvedValue(undefined);
      const clearCacheSpy = jest.spyOn(listener as any, 'clearCacheForDeletedRecord').mockResolvedValue(undefined);

      await listener.handleMedicalRecordDeleted(mockDeletedEvent);

      expect(logAuditSpy).toHaveBeenCalled();
      expect(sendNotificationSpy).toHaveBeenCalled();
      expect(updateStatsSpy).toHaveBeenCalled();
      expect(clearCacheSpy).toHaveBeenCalled();
    });
  });

  // ==================== HANDLE RESTORED EVENT TESTS ====================
  describe('handleMedicalRecordRestored', () => {
    it('should handle restored event', async () => {
      const restoredEvent = {
        medicalRecordId: 1,
        restoredBy: 1,
      };

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await listener.handleMedicalRecordRestored(restoredEvent);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('restored'),
      );
    });

    it('should call private methods for restoration', async () => {
      const restoredEvent = {
        medicalRecordId: 1,
        restoredBy: 1,
      };

      const logAuditSpy = jest.spyOn(listener as any, 'logAuditTrail').mockResolvedValue(undefined);
      const sendNotificationSpy = jest.spyOn(listener as any, 'sendRestorationNotification').mockResolvedValue(undefined);

      await listener.handleMedicalRecordRestored(restoredEvent);

      expect(logAuditSpy).toHaveBeenCalled();
      expect(sendNotificationSpy).toHaveBeenCalled();
    });

    it('should handle errors during restoration', async () => {
      const restoredEvent = {
        medicalRecordId: 1,
        restoredBy: 1,
      };

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      jest.spyOn(listener as any, 'logAuditTrail').mockRejectedValue(
        new Error('Audit failed'),
      );

      await listener.handleMedicalRecordRestored(restoredEvent);

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // ==================== PRIVATE METHODS TESTS ====================
  describe('Private Methods', () => {
    it('should log audit trail with correct severity', async () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();

      await (listener as any).logAuditTrail('test', {}, 'info');

      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.any(String),
      );
    });

    it('should handle notification sending', async () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();

      await (listener as any).sendNotification(mockCreatedEvent);

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should handle statistics update', async () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();

      await (listener as any).updateStatistics(mockCreatedEvent);

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should handle cache invalidation', async () => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();

      await (listener as any).invalidateCache(mockUpdatedEvent);

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should handle archiving before deletion', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await (listener as any).archiveBeforePermanentDeletion(mockDeletedEvent);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Archiving'),
      );
    });
  });
});