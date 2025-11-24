// backend/src/payments/domain/entities/payment.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';

export enum MetodePembayaran {
    TUNAI = 'tunai',
    TRANSFER = 'transfer',
    KARTU_KREDIT = 'kartu_kredit',
    KARTU_DEBIT = 'kartu_debit',
    QRIS = 'qris',
}

export enum StatusPembayaran {
    PENDING = 'pending',
    LUNAS = 'lunas',
    SEBAGIAN = 'sebagian',
    DIBATALKAN = 'dibatalkan',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', name: 'medical_record_id' })
    @Index('idx_payment_medical_record')
    medicalRecordId: number;

    @Column({ type: 'int', name: 'patient_id' })
    @Index('idx_payment_patient')
    patientId: number;

    @Column({ type: 'varchar', length: 50, unique: true, name: 'nomor_invoice' })
    @Index('idx_payment_nomor_invoice')
    nomorInvoice: string;

    @Column({ type: 'datetime', name: 'tanggal_pembayaran' })
    @Index('idx_payment_tanggal')
    tanggalPembayaran: Date;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_biaya' })
    totalBiaya: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'diskon_total' })
    diskonTotal: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_akhir' })
    totalAkhir: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, name: 'jumlah_bayar' })
    jumlahBayar: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    kembalian: number;

    @Column({
        type: 'enum',
        enum: MetodePembayaran,
        name: 'metode_pembayaran',
    })
    metodePembayaran: MetodePembayaran;

    @Column({
        type: 'enum',
        enum: StatusPembayaran,
        default: StatusPembayaran.PENDING,
        name: 'status_pembayaran',
    })
    @Index('idx_payment_status')
    statusPembayaran: StatusPembayaran;

    @Column({ type: 'text', nullable: true })
    keterangan: string;

    @Column({ type: 'int', nullable: true, name: 'created_by' })
    @Index('idx_payment_created_by')
    createdBy: number;

    @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'datetime', precision: 6, name: 'deleted_at', nullable: true })
    deletedAt: Date;
}