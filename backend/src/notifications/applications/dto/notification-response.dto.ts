// applications/dto/notification-response.dto.ts
import { NotificationStatus, NotificationType } from '../../domains/entities/notification.entity';

export class NotificationResponseDto {
    id: number;
    appointment_id: number;
    type: NotificationType;
    status: NotificationStatus;
    send_at: Date;
    sent_at: Date | null;
    created_at: Date;
    updated_at: Date;
    appointment?: {
        id: number;
        tanggal_janji: Date;
        jam_janji: string;
        patient?: {
            id: number;
            nama_lengkap: string;
            email: string;
        };
        doctor?: {
            id: number;
            nama_lengkap: string;
        };
    };
}