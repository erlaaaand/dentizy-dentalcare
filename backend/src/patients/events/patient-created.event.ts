import { Patient } from '../entities/patient.entity';

export class PatientCreatedEvent {
    constructor(public readonly patient: Patient) { }
}
