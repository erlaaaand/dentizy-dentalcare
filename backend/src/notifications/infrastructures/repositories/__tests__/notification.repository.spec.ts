// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { Notification, NotificationStatus, NotificationType } from '../../../domains/entities/notification.entity';
import { QueryNotificationsDto } from '../../../applications/dto/query-notifications.dto';
import { Logger } from '@nestjs/common';

// 2. MOCK DATA
const mockNotificationEntity: Partial<Notification> = {
  id: 1,
  appointment_id: 101,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date(Date.now() - 60000),
  retry_count: 0,
  error_message: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockNotificationStale: Partial<Notification> = {
  id: 2,
  appointment_id: 102,
  type: NotificationType.SMS_REMINDER,
  status: NotificationStatus.SENT,
  sent_at: new Date(Date.now() - 20 * 60 * 1000),
  retry_count: 1,
  error_message: null,
};

const mockNotificationUpcoming: Partial<Notification> = {
  id: 3,
  appointment_id: 103,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date(Date.now() + 60 * 60 * 1000),
  retry_count: 0,
};

const mockNotifications = [
  { ...mockNotificationEntity } as Notification,
  { ...mockNotificationStale } as Notification,
  { ...mockNotificationUpcoming } as Notification,
];

// --- PERBAIKAN PENTING 1: Definisi Mock Query Builder ---
// Kita definisikan ini sebagai satu sumber kebenaran (Single Source of Truth)
const mockQueryBuilder = {
  // Chaining methods (harus return this)
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),

  // Terminal methods (return data)
  // Penting: Tambahkan getManyAndCount karena pagination TypeORM sering pakai ini
  getManyAndCount: jest.fn().mockResolvedValue([mockNotifications, 3]),
  getMany: jest.fn().mockResolvedValue(mockNotifications),
  getCount: jest.fn().mockResolvedValue(3),
  execute: jest.fn().mockResolvedValue({ affected: 1, raw: {} }),
};

// --- PERBAIKAN PENTING 2: Mock Repository ---
const mockRepository = {
  create: jest.fn(data => data),
  save: jest.fn(data => Promise.resolve(data)),
  findOne: jest.fn(),
  find: jest.fn(() => Promise.resolve(mockNotifications)),
  count: jest.fn(() => Promise.resolve(3)),
  update: jest.fn(() => Promise.resolve({ affected: 1, raw: {} })),
  increment: jest.fn(() => Promise.resolve({ affected: 1, raw: {} })),

  // KUNCI PERBAIKAN:
  // Saat createQueryBuilder dipanggil, KEMBALIKAN variabel mockQueryBuilder di atas.
  // Jangan buat objek baru ({ ... }) di sini.
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

// 3. TEST SUITE
describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let typeormRepository: Repository<Notification>;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        }
      ],
    }).compile();

    repository = module.get<NotificationRepository>(NotificationRepository);
    typeormRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));

    jest.clearAllMocks();
  });

  // 5. EXECUTE METHOD TESTS (CRUD & Basic Queries)

  describe('create', () => {
    it('should create and save a new notification', async () => {
      const newNotification: Partial<Notification> = {
        appointment_id: 99,
        type: NotificationType.EMAIL_REMINDER
      };
      (typeormRepository.save as jest.Mock).mockResolvedValueOnce({
        id: 4,
        status: NotificationStatus.PENDING,
        send_at: new Date(),
        retry_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        ...newNotification
      } as Notification); // Konversi di sini sekarang memiliki overlap yang cukup

      const result = await repository.create(newNotification);

      expect(typeormRepository.create).toHaveBeenCalledWith(newNotification);
      expect(result).toHaveProperty('id');
      expect(result.retry_count).toBe(0); // Memastikan field baru ada
    });
  });

  describe('findById', () => {
    it('should find a notification by ID with required relations', async () => {
      (typeormRepository.findOne as jest.Mock).mockResolvedValueOnce(mockNotifications[0]);

      await repository.findById(1);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
      });
    });
  });

  describe('findPendingToSend', () => {
    it('should find pending notifications that are due, ordered by send_at ASC', async () => {
      await repository.findPendingToSend(25);

      expect(typeormRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: NotificationStatus.PENDING,
          send_at: expect.anything(),
        }),
        relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
        order: { send_at: 'ASC' },
        take: 25,
      }));
    });
  });

  describe('findStaleProcessing', () => {
    it('should find notifications with SENT status older than timeout', async () => {
      // Act
      await repository.findStaleProcessing(10); // 10 minutes

      // Assert
      const call = (typeormRepository.find as jest.Mock).mock.calls[0][0];

      // Menguji logika bisnis yang ada (SENT status)
      expect(call.where.status).toBe(NotificationStatus.SENT);

      // Periksa logika LessThan(staleTime)
      const staleTime = call.where.sent_at.value;
      const difference = Date.now() - staleTime.getTime();

      // Perkiraan bahwa staleTime harus sekitar 10 menit yang lalu
      expect(difference).toBeGreaterThan(599000);
    });
  });

  // 6. SUB-GROUP TESTS (Update Statuses)

  describe('markAsProcessing (Update Implementation Bug/Feature)', () => {
    // CATATAN: Kode Anda menggunakan NotificationStatus.SENT dan sent_at baru
    // untuk markAsProcessing, yang umumnya digunakan untuk marking "sent" 
    // bukan "processing" di TypeORM. Kita uji sesuai implementasi kode.
    it('should update status to SENT and set sent_at for given IDs', async () => {
      const ids = [1, 2];
      await repository.markAsProcessing(ids);

      // Assert
      expect(typeormRepository.update).toHaveBeenCalledWith(
        { id: In(ids) },
        expect.objectContaining({
          status: NotificationStatus.SENT, // Menguji sesuai implementasi
          sent_at: expect.any(Date),
        })
      );
    });
  });

  describe('markAsSent', () => {
    it('should update status to SENT and set sent_at for a single ID', async () => {
      await repository.markAsSent(5);

      expect(typeormRepository.update).toHaveBeenCalledWith(
        5,
        expect.objectContaining({
          status: NotificationStatus.SENT,
          sent_at: expect.any(Date),
        })
      );
    });
  });

  describe('markAsFailed', () => {
    it('should increment retry_count and update status to FAILED with error message', async () => {
      const errorMessage = 'Authentication failed';
      // Act
      await repository.markAsFailed(6, errorMessage);

      // Assert
      // 1. Increment call (PENTING: Menguji penambahan retry_count)
      expect(typeormRepository.increment).toHaveBeenCalledWith(
        { id: 6 }, 'retry_count', 1
      );
      // 2. Update call
      expect(typeormRepository.update).toHaveBeenCalledWith(
        6,
        expect.objectContaining({
          status: NotificationStatus.FAILED,
          error_message: errorMessage,
        })
      );
    });

    it('should set error_message to null if not provided', async () => {
      await repository.markAsFailed(7);

      expect(typeormRepository.update).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          status: NotificationStatus.FAILED,
          error_message: null,
        })
      );
    });
  });

  describe('cancelForAppointment', () => {
    // Di dalam describe('cancelForAppointment', () => { ... }):

    it('should update PENDING notifications for a specific appointment to FAILED', async () => {
      // Arrange
      const affectedRows = 2;

      // Untuk tes ini, kita bisa override return value execute khusus di sini
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: affectedRows, raw: {} });

      // Act
      const result = await repository.cancelForAppointment(101);

      // Assert
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Notification);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ status: NotificationStatus.FAILED });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('appointment_id = :appointmentId', { appointmentId: 101 });
      expect(result).toBe(affectedRows);
    });
  });

  // Subgroup: findAll (Pagination and Filtering)

  describe('findAll', () => {
    const query: QueryNotificationsDto = { page: 2, limit: 1, status: NotificationStatus.PENDING, type: NotificationType.EMAIL_REMINDER };

    // Di dalam describe('findAll', () => { ... })

    it('should execute complex query with pagination and filters including doctor relation', async () => {
      // Arrange
      const query: QueryNotificationsDto = { page: 2, limit: 1, status: NotificationStatus.PENDING, type: NotificationType.EMAIL_REMINDER };

      // Mock spesifik untuk test ini jika perlu (opsional, karena default sudah ada di atas)
      // mockQueryBuilder.getManyAndCount.mockResolvedValue([mockNotifications, 3]);

      // Act
      const result = await repository.findAll(query);

      // Assert

      // 1. Pastikan createQueryBuilder dipanggil dengan alias yang benar
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('notification');

      // 2. Cek Joins
      // Karena mockRepository me-return mockQueryBuilder global, pengecekan ini sekarang VALID
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('notification.appointment', 'appointment');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('appointment.doctor', 'doctor');

      // 3. Check filtering
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('notification.status = :status', { status: NotificationStatus.PENDING });

      // 4. Check pagination
      // Page 2, Limit 1 -> Skip = (2-1)*1 = 1
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(1);

      // 5. Verify Result Metadata
      expect(result.meta.totalPages).toBe(3);
    });
  });

  // Subgroup: getStatistics

  describe('getStatistics', () => {
    it('should calculate all notification statistics correctly', async () => {
      // Arrange
      // Total, Pending, Sent, Failed, Scheduled Today, Scheduled This Week
      (typeormRepository.count as jest.Mock)
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(400)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(80);

      // Act
      const stats = await repository.getStatistics();

      // Assert
      expect(typeormRepository.count).toHaveBeenCalledTimes(6);

      // Cek pemanggilan count untuk status PENDING (untuk scheduled_today/this_week)
      const scheduledTodayCall = (typeormRepository.count as jest.Mock).mock.calls[4][0];
      expect(scheduledTodayCall.where.status).toBe(NotificationStatus.PENDING);

      // Check structure of result
      expect(stats).toEqual({
        total: 500,
        pending: 50,
        sent: 400,
        failed: 50,
        scheduled_today: 15,
        scheduled_this_week: 80,
      });
    });
  });
});