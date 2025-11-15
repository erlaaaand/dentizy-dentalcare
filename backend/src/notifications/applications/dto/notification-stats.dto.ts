// applications/dto/notification-stats.dto.ts
export class NotificationStatsDto {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    scheduled_today: number;
    scheduled_this_week: number;
}