import { Appointment } from '../../appointments/domains/entities/appointment.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

export enum NotificationType {
    EMAIL_REMINDER = 'email_reminder',
    SMS_REMINDER = 'sms_reminder',
    WHATSAPP_CONFIRMATION = 'whatsapp_confirmation',
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    appointment_id: number;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus;

    @Column({ type: 'timestamp', nullable: true })
    send_at: Date; // Jadwal kapan notifikasi harus dikirim

    @Column({ type: 'timestamp', nullable: true })
    sent_at: Date; // Waktu saat notifikasi berhasil terkirim

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Appointment)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;
}