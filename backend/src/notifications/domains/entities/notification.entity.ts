// domains/entities/notification.entity.ts
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
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
@Index(['status', 'send_at']) // Composite index untuk cron job query
@Index(['appointment_id', 'status']) // Index untuk cancel operations
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
    @Index() // Index untuk filtering by status
    status: NotificationStatus;

    @Column({ type: 'timestamp' })
    @Index() // Index untuk scheduling queries
    send_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    sent_at: Date | null;

    @Column({ type: 'text', nullable: true })
    error_message: string | null; // Store error for debugging

    @Column({ type: 'int', default: 0 })
    retry_count: number; // Track retry attempts

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Appointment)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;
}