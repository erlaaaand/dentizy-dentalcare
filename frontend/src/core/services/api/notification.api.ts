// frontend/src/core/services/api/notification.api.ts
import {
  useNotificationsControllerFindAll,
  useNotificationsControllerFindOne,
  useNotificationsControllerGetStatistics,
  useNotificationsControllerGetFailedNotifications,
  useNotificationsControllerGetJobStatus,
  useNotificationsControllerRetryNotification,
  useNotificationsControllerRetryAllFailed,
  useNotificationsControllerTriggerManualProcessing,
  useNotificationsControllerStopAllJobs,
  useNotificationsControllerStartAllJobs,
} from '@/core/api/generated/notifications/notifications';

export {
  useNotificationsControllerFindAll as useGetNotifications,
  useNotificationsControllerFindOne as useGetNotification,
  useNotificationsControllerGetStatistics as useGetNotificationStats,
  useNotificationsControllerGetFailedNotifications as useGetFailedNotifications,
  useNotificationsControllerGetJobStatus as useGetJobStatus,
  useNotificationsControllerRetryNotification as useRetryNotification,
  useNotificationsControllerRetryAllFailed as useRetryAllFailed,
  useNotificationsControllerTriggerManualProcessing as useTriggerManualProcessing,
  useNotificationsControllerStopAllJobs as useStopAllJobs,
  useNotificationsControllerStartAllJobs as useStartAllJobs,
};

// Re-export types
export type {
  NotificationResponseDto,
  NotificationStatsDto,
  NotificationsControllerFindAllParams,
  NotificationsControllerGetFailedNotificationsParams,
  NotificationsControllerRetryAllFailedParams,
} from '@/core/api/model';