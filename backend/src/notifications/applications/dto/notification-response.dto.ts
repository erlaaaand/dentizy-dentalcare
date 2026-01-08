import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationStatus,
  NotificationType,
} from '../../domains/entities/notification.entity';

// --- SUB-DTOS (Untuk mendefinisikan struktur nested) ---

class NotificationPatientDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Budi Santoso' })
  nama_lengkap: string;

  @ApiProperty({ example: 'budi@example.com' })
  email: string;
}

class NotificationDoctorDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'dr. Tirta' })
  nama_lengkap: string;
}

class NotificationAppointmentDto {
  @ApiProperty({ example: 50 })
  id: number;

  @ApiProperty({
    description: 'Tanggal janji temu',
    example: '2024-11-25',
    type: Date,
  })
  tanggal_janji: Date;

  @ApiProperty({ description: 'Jam janji temu', example: '09:00:00' })
  jam_janji: string;

  @ApiPropertyOptional({ type: NotificationPatientDto })
  patient?: NotificationPatientDto;

  @ApiPropertyOptional({ type: NotificationDoctorDto })
  doctor?: NotificationDoctorDto;
}

// --- MAIN DTO ---

export class NotificationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 50 })
  appointment_id: number;

  @ApiProperty({
    description: 'Jenis notifikasi (Email/WA)',
    enum: NotificationType,
    example: NotificationType.EMAIL_REMINDER, // Pastikan Enum ini ada value-nya
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Status pengiriman',
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'Waktu yang dijadwalkan untuk dikirim',
    type: Date,
  })
  send_at: Date;

  @ApiPropertyOptional({
    description: 'Waktu aktual terkirim (Null jika belum terkirim)',
    type: Date,
    nullable: true,
    example: null,
  })
  sent_at: Date | null;

  @ApiProperty({ type: Date })
  created_at: Date;

  @ApiProperty({ type: Date })
  updated_at: Date;

  // Relasi Nested
  @ApiPropertyOptional({
    description: 'Detail appointment terkait notifikasi ini',
    type: NotificationAppointmentDto,
  })
  appointment?: NotificationAppointmentDto;
}
