import { Appointment } from '../../appointments/entities/appointment.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
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
}