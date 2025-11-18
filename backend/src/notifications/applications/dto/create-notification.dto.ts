// applications/dto/create-notification.dto.ts
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../../domains/entities/notification.entity';

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