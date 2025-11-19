import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer'; // Ganti Type dengan Transform
import { NotificationType } from '../../domains/entities/notification.entity';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    appointment_id: number;

    @IsNotEmpty()
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsNotEmpty()
    @Transform(({ value }) => {
        return typeof value === 'string' ? new Date(value) : value;
    })
    @IsDate()
    send_at: Date;
}