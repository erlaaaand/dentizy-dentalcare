import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../domains/entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID Appointment yang menjadi sumber notifikasi',
    example: 1502,
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  appointment_id: string;

  @ApiProperty({
    description: 'Jenis notifikasi yang dikirim',
    enum: NotificationType,
    example: NotificationType.EMAIL_REMINDER, // atau salah satu enum Anda
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Tanggal dan waktu ketika notifikasi akan dikirim',
    example: '2025-11-20T14:30:00.000Z',
    required: true,
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? new Date(value) : value,
  )
  @IsDate()
  send_at: Date;
}
