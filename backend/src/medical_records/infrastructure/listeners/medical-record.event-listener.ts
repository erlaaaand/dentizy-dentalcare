import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MedicalRecordCreatedEvent } from '../events/medical-record-created.event';
import { MedicalRecordUpdatedEvent } from '../events/medical-record-updated.event';
import { MedicalRecordDeletedEvent } from '../events/medical-record-deleted.event';

/**
 * Event Listener for Medical Record Domain Events
 * Handles side effects and notifications when medical records change
 */
@Injectable()
export class MedicalRecordEventListener {
  private readonly logger = new Logger(MedicalRecordEventListener.name);

  /**
   * Handle medical record created event
   */
  @OnEvent('medical_record.created')
  async handleMedicalRecordCreated(
    event: MedicalRecordCreatedEvent,
  ): Promise<void> {
    this.logger.log(`📝 ${event.getDescription()}`);

    try {
      // Audit logging
      await this.logAuditTrail('created', event.toJSON());

      // Check completeness
      if (event.metadata?.isComplete) {
        this.logger.log(
          `✅ Medical record #${event.medicalRecordId} is complete with all SOAP fields`,
        );
      } else {
        this.logger.warn(
          `⚠️ Medical record #${event.medicalRecordId} is incomplete`,
        );
      }

      // Send notification to relevant parties
      await this.sendNotification(event);

      // Update statistics/cache
      await this.updateStatistics(event);

      // Trigger external integrations (if any)
      await this.triggerIntegrations(event);
    } catch (error) {
      this.logger.error(
        `Failed to process medical_record.created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle medical record updated event
   */
  @OnEvent('medical_record.updated')
  async handleMedicalRecordUpdated(
    event: MedicalRecordUpdatedEvent,
  ): Promise<void> {
    this.logger.log(`✏️ ${event.getDescription()}`);

    try {
      // Audit logging with change tracking
      await this.logAuditTrail('updated', event.toJSON());

      // Check if record became complete
      if (event.metadata?.isNowComplete && !event.metadata?.wasComplete) {
        this.logger.log(
          `✅ Medical record #${event.medicalRecordId} is now complete`,
        );
        await this.handleRecordCompleted(event);
      }

      // Log significant changes
      if (event.getUpdatedFieldsCount() > 0) {
        this.logger.debug(
          `Updated ${event.getUpdatedFieldsCount()} field(s) in record #${event.medicalRecordId}`,
        );
      }

      // Send update notification
      await this.sendUpdateNotification(event);

      // Invalidate cache
      await this.invalidateCache(event);
    } catch (error) {
      this.logger.error(
        `Failed to process medical_record.updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle medical record deleted event
   */
  @OnEvent('medical_record.deleted')
  async handleMedicalRecordDeleted(
    event: MedicalRecordDeletedEvent,
  ): Promise<void> {
    const severity = event.getSeverity();
    const logMethod = severity === 'critical' ? 'error' : 'warn';

    this.logger[logMethod](`🗑️ ${event.getDescription()}`);

    try {
      // Audit logging with high priority
      await this.logAuditTrail('deleted', event.toJSON(), severity);

      // Send deletion notification
      await this.sendDeletionNotification(event);

      // Archive data if permanent deletion
      if (event.isPermanent()) {
        this.logger.warn(
          `⚠️ PERMANENT DELETION: Medical record #${event.medicalRecordId}`,
        );
        await this.archiveBeforePermanentDeletion(event);
      }

      // Update statistics
      await this.updateDeletionStatistics(event);

      // Clear cache
      await this.clearCacheForDeletedRecord(event);
    } catch (error) {
      this.logger.error(
        `Failed to process medical_record.deleted event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle medical record restored event
   */
  @OnEvent('medical_record.restored')
  async handleMedicalRecordRestored(event: any): Promise<void> {
    this.logger.log(
      `♻️ Medical record #${event.medicalRecordId} restored by user #${event.restoredBy}`,
    );

    try {
      // Audit logging
      await this.logAuditTrail('restored', event);

      // Send restoration notification
      await this.sendRestorationNotification(event);

      // Update statistics
      await this.updateStatistics(event);
    } catch (error) {
      this.logger.error(
        `Failed to process medical_record.restored event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Log audit trail to database/external service
   */
  private async logAuditTrail(
    action: string,
    eventData: Record<string, any>,
    severity: 'info' | 'warning' | 'critical' = 'info',
  ): Promise<void> {
    // TODO: Implement actual audit logging to database or external service
    this.logger.debug(
      `Audit Trail [${severity.toUpperCase()}]: ${action}`,
      JSON.stringify(eventData, null, 2),
    );
  }

  /**
   * Send notification to relevant parties
   */
  private async sendNotification(
    event: MedicalRecordCreatedEvent,
  ): Promise<void> {
    // TODO: Implement notification service (email, SMS, push notification)
    this.logger.debug(
      `Notification sent for medical record #${event.medicalRecordId}`,
    );
  }

  /**
   * Send update notification
   */
  private async sendUpdateNotification(
    event: MedicalRecordUpdatedEvent,
  ): Promise<void> {
    // TODO: Implement notification service
    this.logger.debug(
      `Update notification sent for medical record #${event.medicalRecordId}`,
    );
  }

  /**
   * Send deletion notification
   */
  private async sendDeletionNotification(
    event: MedicalRecordDeletedEvent,
  ): Promise<void> {
    // TODO: Implement notification service
    this.logger.debug(
      `Deletion notification sent for medical record #${event.medicalRecordId}`,
    );
  }

  /**
   * Send restoration notification
   */
  private async sendRestorationNotification(event: any): Promise<void> {
    // TODO: Implement notification service
    this.logger.debug(
      `Restoration notification sent for medical record #${event.medicalRecordId}`,
    );
  }

  /**
   * Update statistics/analytics
   */
  private async updateStatistics(event: any): Promise<void> {
    // TODO: Update statistics in cache or analytics service
    this.logger.debug('Statistics updated');
  }

  /**
   * Update deletion statistics
   */
  private async updateDeletionStatistics(
    event: MedicalRecordDeletedEvent,
  ): Promise<void> {
    // TODO: Track deletion metrics
    this.logger.debug('Deletion statistics updated');
  }

  /**
   * Trigger external integrations (e.g., HL7, FHIR)
   */
  private async triggerIntegrations(
    event: MedicalRecordCreatedEvent,
  ): Promise<void> {
    // TODO: Implement external integrations
    this.logger.debug('External integrations triggered');
  }

  /**
   * Handle record completion
   */
  private async handleRecordCompleted(
    event: MedicalRecordUpdatedEvent,
  ): Promise<void> {
    // TODO: Trigger completion workflows (e.g., billing, reporting)
    this.logger.log(
      `Record completion workflow triggered for #${event.medicalRecordId}`,
    );
  }

  /**
   * Invalidate cache after update
   */
  private async invalidateCache(
    event: MedicalRecordUpdatedEvent,
  ): Promise<void> {
    // TODO: Clear relevant cache entries
    this.logger.debug(
      `Cache invalidated for medical record #${event.medicalRecordId}`,
    );
  }

  /**
   * Clear cache for deleted record
   */
  private async clearCacheForDeletedRecord(
    event: MedicalRecordDeletedEvent,
  ): Promise<void> {
    // TODO: Clear all cache entries for deleted record
    this.logger.debug(
      `Cache cleared for deleted record #${event.medicalRecordId}`,
    );
  }

  /**
   * Archive data before permanent deletion
   */
  private async archiveBeforePermanentDeletion(
    event: MedicalRecordDeletedEvent,
  ): Promise<void> {
    // TODO: Archive to backup storage before permanent deletion
    this.logger.warn(
      `Archiving data for permanent deletion of record #${event.medicalRecordId}`,
    );
  }
}
