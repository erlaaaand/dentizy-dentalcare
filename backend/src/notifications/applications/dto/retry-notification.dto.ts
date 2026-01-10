import { IsNotEmpty, IsNumber, IsDefined } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RetryNotificationDto {
  @ApiProperty({
    description: 'ID notifikasi yang akan dicoba ulang pengirimannya',
    example: 12345,
    required: true,
    type: Number,
  })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (value === '') return value;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return value;

    const parsed = Number(value);
    if (isNaN(parsed)) return value;

    return parsed;
  })
  @IsDefined({ message: 'notification_id must be defined' })
  @IsNotEmpty({ message: 'notification_id must not be empty' })
  @IsNumber({}, { message: 'notification_id must be a number' })
  notification_id: string;
}
