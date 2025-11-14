import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PatientCreatedEvent, PatientUpdatedEvent, PatientDeletedEvent } from '../patients.service';

@Injectable()
export class PatientEventListener {
    private readonly logger = new Logger(PatientEventListener.name);

    /**
     * Handle patient created event
     * Bisa digunakan untuk:
     * - Send welcome email/SMS
     * - Create notification
     * - Update statistics
     * - Trigger webhook
     * - WebSocket broadcast untuk real-time UI update
     */
    @OnEvent('patient.created')
    handlePatientCreated(event: PatientCreatedEvent) {
        this.logger.log(
            `🎉 New patient registered: ${event.patient.nama_lengkap} (${event.patient.nomor_rekam_medis})`
        );

        // TODO: Implement notification logic
        // await this.notificationService.sendWelcomeEmail(event.patient);

        // TODO: WebSocket broadcast untuk update UI real-time
        // await this.websocketGateway.broadcastPatientCreated(event.patient);

        // TODO: Update dashboard statistics
        // await this.dashboardService.incrementPatientCount();
    }

    /**
     * Handle patient updated event
     */
    @OnEvent('patient.updated')
    handlePatientUpdated(event: PatientUpdatedEvent) {
        this.logger.log(`✏️ Patient #${event.patientId} updated`);

        // Log changes untuk audit trail
        this.logger.debug('Changes:', JSON.stringify(event.changes));

        // TODO: WebSocket broadcast untuk update UI
        // await this.websocketGateway.broadcastPatientUpdated(event);

        // TODO: Send notification jika ada perubahan penting
        // if (event.changes.email || event.changes.no_hp) {
        //     await this.notificationService.sendProfileUpdateNotification(event);
        // }
    }

    /**
     * Handle patient deleted event
     */
    @OnEvent('patient.deleted')
    handlePatientDeleted(event: PatientDeletedEvent) {
        this.logger.log(`🗑️ Patient #${event.patientId} (${event.patientName}) deleted`);

        // TODO: Archive patient data
        // await this.archiveService.archivePatient(event.patientId);

        // TODO: Update related records
        // await this.appointmentService.cancelFutureAppointments(event.patientId);

        // TODO: WebSocket broadcast
        // await this.websocketGateway.broadcastPatientDeleted(event);
    }

    /**
     * Handle upcoming appointment reminder
     * Triggered oleh scheduler (cron job)
     */
    @OnEvent('patient.appointment.reminder')
    async handleAppointmentReminder(event: any) {
        this.logger.log(`📅 Sending appointment reminder to patient #${event.patientId}`);

        // TODO: Send SMS/Email reminder
        // await this.notificationService.sendAppointmentReminder(event);
    }

    /**
     * Handle patient with allergies alert
     */
    @OnEvent('patient.allergy.alert')
    handleAllergyAlert(event: any) {
        this.logger.warn(
            `⚠️ ALLERGY ALERT: Patient #${event.patientId} has allergies: ${event.allergies}`
        );

        // TODO: Show prominent warning di UI
        // TODO: Send alert ke dokter yang bertugas
    }

    /**
     * Handle error events untuk monitoring
     */
    @OnEvent('patient.error')
    handlePatientError(event: any) {
        this.logger.error(`❌ Patient operation error:`, event);

        // TODO: Send to error tracking service (Sentry, etc)
        // TODO: Alert admin untuk error kritis
    }
}