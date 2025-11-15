// applications/dto/retry-notification.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RetryNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    notification_id: number;
}

