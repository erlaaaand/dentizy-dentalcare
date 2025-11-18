// applications/dto/notification-stats.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsInt, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { NotificationType } from '../../domains/entities/notification.entity'; // Pastikan path import ini sesuai struktur folder Anda

// 1. Sub-class untuk mendefinisikan isi array 'by_type'
export class NotificationTypeStatDto {
    @Expose()
    @IsEnum(NotificationType)
    type: NotificationType;

    @Expose()
    @IsInt()
    @Min(0)
    count: number;
}

// 2. Class Utama
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

    // 3. Properti yang sebelumnya hilang
    @Expose()
    @IsArray()
    @ValidateNested({ each: true }) // Validasi setiap item di dalam array
    @Type(() => NotificationTypeStatDto) // Transformasi JSON object ke class instance
    by_type: NotificationTypeStatDto[];
}