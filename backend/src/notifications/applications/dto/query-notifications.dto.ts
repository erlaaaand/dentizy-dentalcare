// applications/dto/query-notifications.dto.ts
import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationStatus, NotificationType } from '../../domains/entities/notification.entity';

export class QueryNotificationsDto {
    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}