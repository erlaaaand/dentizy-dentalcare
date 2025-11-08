import { format, parseISO, addMinutes, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { CLINIC_HOURS } from '@/lib/constants';

/**
 * Generate time slots for appointments
 */
export function generateTimeSlots(
  date: Date,
  duration: number = CLINIC_HOURS.APPOINTMENT_DURATION,
  startTime: string = CLINIC_HOURS.START,
  endTime: string = CLINIC_HOURS.END
): string[] {
  const slots: string[] = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  while (currentTime < endDateTime) {
    const timeStr = format(currentTime, 'HH:mm:ss');
    slots.push(timeStr);
    currentTime = addMinutes(currentTime, duration);
  }
  
  return slots;
}

/**
 * Check if time slot is available
 */
export function isTimeSlotAvailable(
  time: string,
  bookedSlots: string[],
  date?: Date
): boolean {
  // Check if slot is already booked
  if (bookedSlots.includes(time)) {
    return false;
  }
  
  // Check if slot is in the past (only if date is today)
  if (date) {
    const now = new Date();
    const today = startOfDay(now);
    const selectedDate = startOfDay(date);
    
    if (selectedDate.getTime() === today.getTime()) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotTime = new Date(date);
      slotTime.setHours(hours, minutes, 0, 0);
      
      if (slotTime <= now) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  } catch (error) {
    return time;
  }
}

/**
 * Get day name in Indonesian
 */
export function getDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE', { locale: id });
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM', { locale: id });
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const checkDate = startOfDay(dateObj);
  
  return checkDate < today;
}

/**
 * Check if time is in the past (for today)
 */
export function isPastTime(date: Date | string, time: string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isToday(dateObj)) {
    return isPastDate(dateObj);
  }
  
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const checkTime = new Date(dateObj);
  checkTime.setHours(hours, minutes, 0, 0);
  
  return checkTime <= now;
}

/**
 * Get available dates for next N days
 */
export function getAvailableDates(days: number = 30): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends (optional - remove if clinic is open on weekends)
    if (!isWeekend(date)) {
      dates.push(date);
    }
  }
  
  return dates;
}

/**
 * Format schedule display
 */
export function formatScheduleDisplay(date: string, time: string): string {
  try {
    const dateObj = parseISO(date);
    const dayName = getDayName(dateObj);
    const formattedDate = format(dateObj, 'dd MMMM yyyy', { locale: id });
    const formattedTime = formatTimeSlot(time);
    
    return `${dayName}, ${formattedDate} - ${formattedTime}`;
  } catch (error) {
    return `${date} - ${time}`;
  }
}

/**
 * Group appointments by date
 */
export function groupAppointmentsByDate<T extends { tanggal_janji: string }>(
  appointments: T[]
): Record<string, T[]> {
  return appointments.reduce((groups, appointment) => {
    const date = appointment.tanggal_janji;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort appointments by time
 */
export function sortAppointmentsByTime<T extends { jam_janji: string }>(
  appointments: T[]
): T[] {
  return [...appointments].sort((a, b) => {
    return a.jam_janji.localeCompare(b.jam_janji);
  });
}