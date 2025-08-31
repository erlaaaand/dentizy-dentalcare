import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    appointment_id: number;

    @IsNotEmpty()
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsNotEmpty()
    @IsDate()
    send_at: Date;
}