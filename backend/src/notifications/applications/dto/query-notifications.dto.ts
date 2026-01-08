// applications/dto/query-notifications.dto.ts
import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationStatus,
  NotificationType,
} from '../../domains/entities/notification.entity';

export class QueryNotificationsDto {
  @ApiProperty({
    description: 'Filter status notifikasi',
    enum: NotificationStatus,
    required: false,
    example: NotificationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({
    description: 'Filter jenis notifikasi',
    enum: NotificationType,
    required: false,
    example: NotificationType.EMAIL_REMINDER,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Nomor halaman untuk pagination',
    required: false,
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Jumlah data per halaman (maksimal 100)',
    required: false,
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
