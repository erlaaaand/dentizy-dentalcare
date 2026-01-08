import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  DefaultValuePipe, // <-- Ditambahkan
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/interface/guards/roles.guard';
import { Roles } from '../../../auth/interface/decorators/roles.decorator';
import { UserRole } from '../../../roles/entities/role.entity';
import { NotificationsService } from '../../applications/orchestrator/notifications.service';
import { NotificationCronService } from '../../infrastructures/jobs/notification-cron.service';
import { QueryNotificationsDto } from '../../applications/dto/query-notifications.dto';
import { NotificationResponseDto } from '../../applications/dto/notification-response.dto';
import { NotificationStatsDto } from '../../applications/dto/notification-stats.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse({ description: 'Token tidak valid atau kadaluarsa' })
@ApiForbiddenResponse({
  description: 'Role user tidak memiliki akses ke endpoint ini',
})
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly cronService: NotificationCronService,
  ) {}

  @Get()
  @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @ApiOperation({
    summary: 'Daftar semua notifikasi dengan pagination',
    description: 'Mendapatkan daftar notifikasi dengan filter dan pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Jumlah per halaman (default: 20)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'sent', 'failed'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['email_reminder', 'sms_reminder', 'whatsapp_confirmation'],
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar notifikasi berhasil diambil',
    type: [NotificationResponseDto],
  })
  async findAll(@Query() query: QueryNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('statistics')
  @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @ApiOperation({
    summary: 'Statistik notifikasi',
    description: 'Mendapatkan statistik notifikasi untuk dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistik notifikasi',
    type: NotificationStatsDto,
  })
  async getStatistics(): Promise<NotificationStatsDto> {
    return this.notificationsService.getStatistics();
  }

  @Get('failed')
  @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
  @ApiOperation({
    summary: 'Daftar notifikasi gagal',
    description: 'Mendapatkan daftar notifikasi yang gagal dikirim',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maksimal 50',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar notifikasi gagal',
    type: [NotificationResponseDto],
  })
  async getFailedNotifications(
    // Diperbaiki: Menggunakan DefaultValuePipe
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getFailedNotifications(limit);
  }

  @Get('jobs/status')
  @Roles(UserRole.KEPALA_KLINIK)
  @ApiOperation({
    summary: 'Status cron jobs',
    description:
      'Mendapatkan status semua cron jobs notifikasi (Kepala Klinik only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Status cron jobs',
    // ... (schema)
  })
  getJobStatus() {
    return this.cronService.getJobStatus();
  }

  @Get(':id')
  @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
  @ApiOperation({ summary: 'Detail notifikasi by ID' })
  @ApiParam({ name: 'id', description: 'ID Notifikasi' })
  @ApiResponse({
    status: 200,
    description: 'Detail notifikasi',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notifikasi tidak ditemukan' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id);
  }

  @Post(':id/retry')
  @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Retry notifikasi gagal',
    description: 'Mencoba ulang pengiriman notifikasi yang gagal',
  })
  @ApiParam({ name: 'id', description: 'ID Notifikasi' })
  @ApiResponse({
    status: 200,
    description: 'Notifikasi dijadwalkan ulang',
    // ... (schema)
  })
  @ApiResponse({ status: 404, description: 'Notifikasi tidak ditemukan' })
  @ApiResponse({
    status: 400,
    description:
      'Notifikasi tidak dalam status FAILED atau sudah melebihi batas retry',
  })
  async retryNotification(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.notificationsService.retryNotification(id);
    return { message: `Notification #${id} queued for retry` };
  }

  @Post('retry-all-failed')
  @Roles(UserRole.KEPALA_KLINIK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry semua notifikasi gagal',
    description:
      'Mencoba ulang pengiriman semua notifikasi yang gagal (Kepala Klinik only)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maksimal 50',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifikasi berhasil dijadwalkan ulang',
    // ... (schema)
  })
  async retryAllFailed(
    // Diperbaiki: Menggunakan DefaultValuePipe
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<{ message: string; count: number }> {
    const count = await this.notificationsService.retryAllFailed(limit);
    return {
      message: `Successfully queued ${count} failed notification(s) for retry`,
      count,
    };
  }

  @Post('jobs/trigger-manual')
  @Roles(UserRole.KEPALA_KLINIK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger manual processing',
    description:
      'Memicu pemrosesan notifikasi secara manual (Kepala Klinik only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pemrosesan manual berhasil',
    // ... (schema)
  })
  async triggerManualProcessing() {
    return this.cronService.triggerManualProcessing();
  }

  @Post('jobs/stop-all')
  @Roles(UserRole.KEPALA_KLINIK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop semua cron jobs',
    description:
      'Menghentikan semua cron jobs notifikasi (Kepala Klinik only) - USE WITH CAUTION',
  })
  @ApiResponse({
    status: 200,
    description: 'Semua cron jobs dihentikan',
    // ... (schema)
  })
  stopAllJobs(): { message: string } {
    this.cronService.stopAllJobs();
    return { message: 'All notification cron jobs stopped' };
  }

  @Post('jobs/start-all')
  @Roles(UserRole.KEPALA_KLINIK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start semua cron jobs',
    description: 'Memulai semua cron jobs notifikasi (Kepala Klinik only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Semua cron jobs dimulai',
    // ... (schema)
  })
  startAllJobs(): { message: string } {
    this.cronService.startAllJobs();
    return { message: 'All notification cron jobs started' };
  }
}
