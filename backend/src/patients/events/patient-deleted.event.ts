export class PatientDeletedEvent {
    constructor(
        public readonly patientId: number,
        public readonly patientName: string
    ) { }
}
