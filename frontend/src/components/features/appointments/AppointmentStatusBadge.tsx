'use client';

import React from 'react';
import { AppointmentStatus } from '@/types/api';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import { getAppointmentStatusColor } from '@/lib/constants/statusColors';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className = '' }: AppointmentStatusBadgeProps) {
  const colors = getAppointmentStatusColor(status);
  const label = APPOINTMENT_STATUS_LABELS[status];
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} ${className}`}
    >
      {label}
    </span>
  );
}