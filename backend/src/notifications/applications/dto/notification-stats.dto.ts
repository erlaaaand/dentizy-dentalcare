// applications/dto/notification-stats.dto.ts
import { Expose, Type } from 'class-transformer';
import {
    IsInt,
    Min,
    IsArray,
    ValidateNested,
    IsEnum,
    IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../domains/entities/notification.entity';

// 1. Sub-class untuk array "by_type"
export class NotificationTypeStatDto {

    @ApiProperty({
        description: 'Jenis notifikasi berdasarkan enum NotificationType',
        enum: NotificationType,
        example: NotificationType.EMAIL_REMINDER
    })
    @Expose()
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Jumlah notifikasi berdasarkan jenisnya',
        example: 42,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    count: number;
}

// 2. Class Utama
export class NotificationStatsDto {

    @ApiProperty({
        description: 'Total semua notifikasi',
        example: 150,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    total: number;

    @ApiProperty({
        description: 'Jumlah notifikasi yang masih pending',
        example: 30,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    pending: number;

    @ApiProperty({
        description: 'Jumlah notifikasi yang berhasil dikirim',
        example: 100,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    sent: number;

    @ApiProperty({
        description: 'Jumlah notifikasi yang gagal dikirim',
        example: 20,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    failed: number;

    @ApiProperty({
        description: 'Jumlah notifikasi yang dijadwalkan hari ini',
        example: 5,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    scheduled_today: number;

    @ApiProperty({
        description: 'Jumlah notifikasi yang dijadwalkan minggu ini',
        example: 18,
        minimum: 0,
    })
    @Expose()
    @IsInt()
    @Min(0)
    scheduled_this_week: number;

    @ApiProperty({
        description: 'Statistik notifikasi berdasarkan jenis notifikasi',
        required: false,
        type: [NotificationTypeStatDto],
        example: [
            { type: NotificationType.EMAIL_REMINDER, count: 40 },
            { type: NotificationType.SMS_REMINDER, count: 20 },
            { type: NotificationType.WHATSAPP_CONFIRMATION, count: 20 }
        ]
    })
    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationTypeStatDto)
    @IsOptional()
    by_type?: NotificationTypeStatDto[];
}
