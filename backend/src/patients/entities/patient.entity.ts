import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical_records/entities/medical_record.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    Index,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum Gender {
    MALE = 'L',
    FEMALE = 'P',
}

@Entity('patients')
// Composite indexes untuk optimasi query yang sering digunakan
@Index('idx_patient_search', ['nama_lengkap', 'nik', 'email'])
@Index('idx_patient_active', ['deleted_at']) // Untuk soft delete queries
export class Patient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    @Index('idx_patient_nomor_rekam_medis')
    nomor_rekam_medis: string;

    @Column({ length: 16, unique: true, nullable: true })
    @Index('idx_patient_nik')
    nik: string;

    @Column({ length: 250 })
    @Index('idx_patient_nama', { fulltext: true }) // Fulltext index untuk searching
    nama_lengkap: string;

    @Column({ type: 'date', nullable: true })
    tanggal_lahir: Date;

    @Column({ type: 'text', nullable: true })
    alamat: string;

    @Column({ length: 250, nullable: true, unique: true })
    @Index('idx_patient_email')
    email: string;

    @Column({ length: 20, nullable: true })
    no_hp: string;

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    jenis_kelamin: Gender;

    // Informasi tambahan untuk klinik gigi
    @Column({ type: 'text', nullable: true })
    riwayat_alergi: string;

    @Column({ type: 'text', nullable: true })
    riwayat_penyakit: string;

    @Column({ type: 'text', nullable: true })
    catatan_khusus: string;

    @Column({ default: false })
    @Index('idx_patient_online_status')
    is_registered_online: boolean;

    @Column({ default: true })
    @Index('idx_patient_active_status')
    is_active: boolean;

    @Column({ type: 'varchar', length: 250, nullable: true })
    pekerjaan: string;

    // Audit fields
    @CreateDateColumn()
    @Index('idx_patient_created_at')
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    @Exclude() // Jangan return di response
    deleted_at: Date;

    // Relations
    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    appointments: Appointment[];

    @OneToMany(() => MedicalRecord, (record) => record.patient)
    medical_records: MedicalRecord[];

    // Virtual fields (computed)
    get umur(): number | null {
        if (!this.tanggal_lahir) return null;
        const today = new Date();
        const birthDate = new Date(this.tanggal_lahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    get is_new_patient(): boolean {
        const daysSinceCreation = Math.floor(
            (new Date().getTime() - new Date(this.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceCreation <= 30;
    }

    // Hooks
    @BeforeInsert()
    @BeforeUpdate()
    normalizeData() {
        if (this.email) {
            this.email = this.email.toLowerCase().trim();
        }
        if (this.nama_lengkap) {
            this.nama_lengkap = this.nama_lengkap.trim();
        }
        if (this.no_hp) {
            this.no_hp = this.no_hp.replace(/\s+/g, '');
        }
    }
}