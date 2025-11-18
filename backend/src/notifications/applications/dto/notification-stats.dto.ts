// applications/dto/notification-stats.dto.ts
import { Expose, Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class NotificationStatsDto {
    @Expose()
    @IsInt()
    @Min(0)
    total: number;

    @Expose()
    @IsInt()
    @Min(0)
    pending: number;

    @Expose()
    @IsInt()
    @Min(0)
    sent: number;

    @Expose()
    @IsInt()
    @Min(0)
    failed: number;

    @Expose()
    @IsInt()
    @Min(0)
    scheduled_today: number;

    @Expose()
    @IsInt()
    @Min(0)
    scheduled_this_week: number;
}
