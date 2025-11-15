import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/domains/entities/patient.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('medical_records')
export class MedicalRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    appointment_id: number;

    @Column({ nullable: true }) // ID staf yang mencatat, bisa nullable jika diisi dokter
    user_id_staff: number;

    @Column()
    patient_id: number;

    // --- Implementasi SOAP ---

    @Column({ type: 'text', nullable: true })
    subjektif: string; // (S) Keluhan dan anamnesis dari pasien

    @Column({ type: 'text', nullable: true })
    objektif: string; // (O) Temuan objektif dari pemeriksaan dokter

    @Column({ type: 'text', nullable: true })
    assessment: string; // (A) Diagnosis dari dokter

    @Column({ type: 'text', nullable: true })
    plan: string; // (P) Rencana penanganan dan resep

    // --- Kolom Waktu ---

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // --- Relasi ---

    @OneToOne(() => Appointment, (appointment) => appointment.medical_record)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @ManyToOne(() => User, (user) => user.medical_records, { eager: true })
    @JoinColumn({ name: 'user_id_staff' })
    user_staff: User;

    @ManyToOne(() => Patient, (patient) => patient.medical_records)
    @JoinColumn({ name: 'patient_id' }) // <-- ATAU INI YANG HILANG
    patient: Patient;
}