import { UpdatePatientDto } from '../dto/update-patient.dto';

export class PatientUpdatedEvent {
    constructor(
        public readonly patientId: number,
        public readonly changes: Partial<UpdatePatientDto>
    ) { }
}
