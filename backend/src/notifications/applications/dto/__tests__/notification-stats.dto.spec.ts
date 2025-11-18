// applications/dto/__tests__/notification-stats.dto.spec.ts
import { NotificationStatsDto } from '../notification-stats.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotificationType } from '../../../../notifications/domains/entities/notification.entity';

describe('NotificationStatsDto', () => {
  const mockData = {
    total: 120,
    pending: 10,
    sent: 100,
    failed: 5,
    scheduled_today: 3,
    scheduled_this_week: 7,
    by_type: [
      { type: NotificationType.EMAIL_REMINDER, count: 50 },
      { type: NotificationType.SMS_REMINDER, count: 70 },
    ],
  };


  it('should map values correctly', () => {
    const dto = plainToInstance(NotificationStatsDto, mockData);
    expect(dto).toMatchObject(mockData);
  });

  it('should validate all fields properly', async () => {
    const dto = plainToInstance(NotificationStatsDto, mockData);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail for invalid values', async () => {
    const dto = plainToInstance(NotificationStatsDto, {
      total: -1, // invalid
      pending: -5, // invalid
      sent: 10,
      failed: 0,
      scheduled_today: 1,
      scheduled_this_week: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
