// infrastructures/repositories/notification.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, Between } from 'typeorm';
import {
  Notification,
  NotificationStatus,
} from '../../domains/entities/notification.entity';
import { QueryNotificationsDto } from '../../applications/dto/query-notifications.dto';

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  /**
   * Create notification
   */
  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  /**
   * Update notification
   */
  async update(notification: Notification): Promise<Notification> {
    return this.repository.save(notification);
  }

  /**
   * Find by ID with relations
   * ✅ FIXED: Menggunakan 'doctor' bukan 'doctor_id'
   */
  async findById(id: number): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
    });
  }

  /**
   * Find pending notifications to send (optimized for cron)
   * ✅ FIXED: Menggunakan 'doctor' bukan 'doctor_id'
   */
  async findPendingToSend(limit: number = 50): Promise<Notification[]> {
    const now = new Date();

    return this.repository.find({
      where: {
        status: NotificationStatus.PENDING,
        send_at: LessThan(now),
      },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
      order: {
        send_at: 'ASC',
      },
      take: limit,
    });
  }

  /**
   * Find stale processing notifications
   */
  async findStaleProcessing(
    timeoutMinutes: number = 5,
  ): Promise<Notification[]> {
    const staleTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    return this.repository.find({
      where: {
        status: NotificationStatus.SENT,
        sent_at: LessThan(staleTime),
      },
    });
  }

  /**
   * Cancel pending notifications for appointment
   */
  async cancelForAppointment(appointmentId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({ status: NotificationStatus.FAILED })
      .where('appointment_id = :appointmentId', { appointmentId })
      .andWhere('status = :status', { status: NotificationStatus.PENDING })
      .execute();

    return result.affected || 0;
  }

  /**
   * Mark notifications as processing
   */
  async markAsProcessing(notificationIds: number[]): Promise<void> {
    await this.repository.update(
      { id: In(notificationIds) },
      { status: NotificationStatus.SENT, sent_at: new Date() },
    );
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(notificationId: number): Promise<void> {
    await this.repository.update(notificationId, {
      status: NotificationStatus.SENT,
      sent_at: new Date(),
    });
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(
    notificationId: number,
    errorMessage?: string,
  ): Promise<void> {
    await this.repository.increment({ id: notificationId }, 'retry_count', 1);
    await this.repository.update(notificationId, {
      status: NotificationStatus.FAILED,
      error_message: errorMessage || null,
    });
  }

  /**
   * Get all notifications with pagination and filters
   * ✅ FIXED: Menggunakan 'doctor' bukan 'doctor_id'
   */
  async findAll(query: QueryNotificationsDto): Promise<{
    data: Notification[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, status, type } = query;

    const queryBuilder = this.repository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.appointment', 'appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor'); // ✅ FIXED

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const data = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('notification.created_at', 'DESC')
      .getMany();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get failed notifications
   */
  async findFailed(limit: number = 50): Promise<Notification[]> {
    return this.repository.find({
      where: {
        status: NotificationStatus.FAILED,
      },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
      order: {
        updated_at: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
    scheduled_today: number;
    scheduled_this_week: number;
    // 1. Definisikan tipenya di sini
    by_type?: { type: string; count: number }[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // 2. Tambahkan query aggregation ke dalam Promise.all
    const [
      total,
      pending,
      sent,
      failed,
      scheduled_today,
      scheduled_this_week,
      byTypeRaw, // <--- Hasil raw dari query builder
    ] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: NotificationStatus.PENDING } }),
      this.repository.count({ where: { status: NotificationStatus.SENT } }),
      this.repository.count({ where: { status: NotificationStatus.FAILED } }),
      this.repository.count({
        where: {
          status: NotificationStatus.PENDING,
          send_at: Between(today, tomorrow),
        },
      }),
      this.repository.count({
        where: {
          status: NotificationStatus.PENDING,
          send_at: Between(weekStart, weekEnd),
        },
      }),
      // Query untuk by_type (Group By)
      this.repository
        .createQueryBuilder('notification')
        .select('notification.type', 'type')
        .addSelect('COUNT(notification.id)', 'count')
        .groupBy('notification.type')
        .getRawMany(),
    ]);

    // 3. Format hasil raw query agar count menjadi number (biasanya return string dari DB driver)
    const by_type = byTypeRaw.map((item) => ({
      type: item.type,
      count: parseInt(item.count, 10) || 0,
    }));

    return {
      total,
      pending,
      sent,
      failed,
      scheduled_today,
      scheduled_this_week,
      by_type, // <--- Masukkan hasilnya di sini
    };
  }
}
