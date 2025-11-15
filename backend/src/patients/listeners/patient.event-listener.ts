import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PatientCreatedEvent } from '../events/patient-created.event';
import { PatientUpdatedEvent } from '../events/patient-updated.event';
import { PatientDeletedEvent } from '../events/patient-deleted.event';

@Injectable()
export class PatientEventListener {
    private readonly logger = new Logger(PatientEventListener.name);

    @OnEvent('patient.created')
    handlePatientCreated(event: PatientCreatedEvent) {
        this.logger.log(`🎉 Patient created: ${event.patient.nama_lengkap}`);
        // TODO: Kirim email, websocket, dashboard update
    }

    @OnEvent('patient.updated')
    handlePatientUpdated(event: PatientUpdatedEvent) {
        this.logger.log(`✏️ Patient updated: ID ${event.patientId}`);
        // TODO: Update logs, notify front-end
    }

    @OnEvent('patient.deleted')
    handlePatientDeleted(event: PatientDeletedEvent) {
        this.logger.log(`🗑️ Patient deleted: ID ${event.patientId} (${event.patientName})`);
        // TODO: Cleanup, notify dashboard
    }
}
