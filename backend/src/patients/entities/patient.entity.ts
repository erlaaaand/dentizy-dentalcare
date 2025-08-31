import { Appointment } from '../../appointments/entities/appointment.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    nomor_rekam_medis: string;

    @Column({ length: 50, unique: true, nullable: true })
    nik: string;

    @Column({ length: 250 })
    nama_lengkap: string;

    // Anda bisa menambahkan kolom lain sesuai kebutuhan, misal:
    @Column()
    tanggal_lahir: Date;

    @Column({ type: 'text', nullable: true })
    alamat: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    appointments: Appointment[];
}