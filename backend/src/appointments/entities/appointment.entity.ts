import { MedicalRecord } from '../../medical_records/entities/medical_record.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';

export enum AppointmentStatus {
    DIJADWALKAN = 'dijadwalkan',
    SELESAI = 'selesai',
    DIBATALKAN = 'dibatalkan',
}

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patient_id: number;

    @Column()
    doctor_id: number;

    @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.DIJADWALKAN })
    status: AppointmentStatus;

    // Anda bisa menambahkan kolom lain, misal:
    @Column()
    tanggal_janji: Date;

    @Column({ type: 'time' }) // Kolom untuk menyimpan jam
    jam_janji: string;

    @Column({ type: 'text', nullable: true })
    keluhan: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Patient, (patient) => patient.appointments)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => User) // Asumsi relasi ke user (dokter)
    @JoinColumn({ name: 'doctor_id' })
    doctor: User;

    @OneToOne(() => MedicalRecord, (record) => record.appointment)
    medical_record: MedicalRecord;
}