import { Appointment } from '../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../users/domains/entities/user.entity';
import { Patient } from '../../../patients/domains/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    BeforeInsert,
    BeforeUpdate,
    OneToOne,
    JoinColumn
} from 'typeorm';

@Entity('medical_records')
@Index('idx_medical_records_appointment_id', ['appointment_id'])
@Index('idx_medical_records_patient_id', ['patient_id'])
@Index('idx_medical_records_doctor_id', ['doctor_id'])
export class MedicalRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    appointment_id: number;

    @Column({ nullable: true })
    doctor_id: number;

    @Column()
    patient_id: number;

    // SOAP fields
    @Column({ type: 'text', nullable: true })
    subjektif: string;

    @Column({ type: 'text', nullable: true })
    objektif: string;

    @Column({ type: 'text', nullable: true })
    assessment: string;

    @Column({ type: 'text', nullable: true })
    plan: string;

    // timestamps
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    // relations
    @OneToOne(() => Appointment, (appointment) => appointment.medical_record)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @ManyToOne(() => User, (user) => user.medical_records, { eager: true })
    @JoinColumn({ name: 'doctor_id' })
    doctor: User;

    @ManyToOne(() => Patient, (patient) => patient.medical_records)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    // normalize
    @BeforeInsert()
    @BeforeUpdate()
    normalizeData() {
        if (this.subjektif) this.subjektif = this.subjektif.trim();
        if (this.objektif) this.objektif = this.objektif.trim();
        if (this.assessment) this.assessment = this.assessment.trim();
        if (this.plan) this.plan = this.plan.trim();
    }

    // virtual field
    get umur_rekam(): number | null {
        if (!this.created_at) return null;
        const today = new Date();
        const created = new Date(this.created_at);
        const diffMs = today.getTime() - created.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
}
