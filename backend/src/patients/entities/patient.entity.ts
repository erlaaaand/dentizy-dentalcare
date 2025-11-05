import { Appointment } from '../../appointments/entities/appointment.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';

@Entity('patients')
// ✅ Composite index untuk pencarian yang sering digunakan
@Index('idx_patient_search', ['nama_lengkap', 'nik', 'email'])
export class Patient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    @Index('idx_patient_nomor_rekam_medis') // Index untuk pencarian by nomor rekam medis
    nomor_rekam_medis: string;

    @Column({ length: 50, unique: true, nullable: true })
    @Index('idx_patient_nik') // Index untuk pencarian by NIK
    nik: string;

    @Column({ length: 250 })
    @Index('idx_patient_nama') // Index untuk pencarian by nama (LIKE query)
    nama_lengkap: string;

    @Column({ type: 'date', nullable: true })
    tanggal_lahir: Date;

    @Column({ type: 'text', nullable: true })
    alamat: string;

    @Column({ length: 250, nullable: true, unique: true })
    @Index('idx_patient_email') // Index untuk pencarian by email
    email: string;

    @Column({ length: 20, nullable: true })
    no_hp: string;

    @Column({ type: 'enum', enum: ['L', 'P'], nullable: true })
    jenis_kelamin: 'L' | 'P';

    @Column({ default: false })
    @Index('idx_patient_online_status') // Index untuk filter by online registration
    is_registered_online: boolean;

    @CreateDateColumn()
    @Index('idx_patient_created_at') // Index untuk sorting by date
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    appointments: Appointment[];
}