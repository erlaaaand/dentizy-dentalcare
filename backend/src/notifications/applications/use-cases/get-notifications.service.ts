// applications/use-cases/get-notifications.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';
import { NotificationMapper } from '../../domains/mappers/notification.mapper';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationStatsDto } from '../dto/notification-stats.dto';
import { NotificationType } from '../../../notifications/domains/entities/notification.entity';

@Injectable()
export class GetNotificationsService {
  private readonly logger = new Logger(GetNotificationsService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async findAll(query: QueryNotificationsDto): Promise<{
    data: NotificationResponseDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      this.logger.debug(
        `Finding notifications with query: ${JSON.stringify(query)}`,
      );

      const result = await this.notificationRepository.findAll(query);

      return {
        data: NotificationMapper.toResponseDtoArray(result.data),
        meta: result.meta,
      };
    } catch (error) {
      this.logger.error('Error fetching notifications:', error.message);
      throw error;
    }
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    try {
      const notification = await this.notificationRepository.findById(id);

      if (!notification) {
        throw new NotFoundException(`Notification #${id} not found`);
      }

      return NotificationMapper.toResponseDto(notification);
    } catch (error) {
      this.logger.error(`Error fetching notification #${id}:`, error.message);
      throw error;
    }
  }

  async getStatistics(): Promise<NotificationStatsDto> {
    try {
      this.logger.debug('Getting notification statistics');

      const stats = await this.notificationRepository.getStatistics();

      this.logger.log('📊 Notification statistics retrieved');

      // LAKUKAN MAPPING DI SINI
      return {
        ...stats,
        by_type: stats.by_type?.map((item) => ({
          // Konversi 'string' ke 'NotificationType' menggunakan 'as'
          type: item.type as NotificationType,
          // Pastikan count berupa number
          count: Number(item.count),
        })),
      };
    } catch (error) {
      this.logger.error(
        'Error getting notification statistics:',
        error.message,
      );
      throw error;
    }
  }

  async getFailedNotifications(
    limit: number = 50,
  ): Promise<NotificationResponseDto[]> {
    try {
      const notifications = await this.notificationRepository.findFailed(limit);
      return NotificationMapper.toResponseDtoArray(notifications);
    } catch (error) {
      this.logger.error('Error getting failed notifications:', error.message);
      throw error;
    }
  }
}
