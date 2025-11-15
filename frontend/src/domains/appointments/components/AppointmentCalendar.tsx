'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '@/core/types/api';
import { appointmentService } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';
import { formatDate, formatTime } from '@/core/formatters';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    format,
    parseISO
} from 'date-fns';
import { id } from 'date-fns/locale';

interface AppointmentCalendarProps {
    onDateSelect?: (date: Date) => void;
    onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ onDateSelect, onAppointmentClick }: AppointmentCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    const { error } = useToastStore();

    useEffect(() => {
        loadMonthAppointments();
    }, [currentMonth]);

    const loadMonthAppointments = async () => {
        setLoading(true);
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            // Load appointments for the month - you may need to adjust this based on your API
            const response = await appointmentService.getAll({
                page: 1,
                limit: 100,
            });

            setAppointments(response.data);
        } catch (err: any) {
            error(err.message || 'Gagal memuat jadwal');
        } finally {
            setLoading(false);
        }
    };

    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter((apt) =>
            isSameDay(parseISO(apt.tanggal_janji), date)
        );
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const renderCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayAppointments = getAppointmentsForDate(currentDay);
                const isCurrentMonth = isSameMonth(currentDay, monthStart);
                const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
                const isToday = isSameDay(currentDay, new Date());

                days.push(
                    <button
                        key={currentDay.toString()}
                        onClick={() => handleDateClick(currentDay)}
                        disabled={!isCurrentMonth}
                        className={`
              relative min-h-[80px] p-2 border border-gray-200 text-left transition-colors
              ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'}
              ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              ${isToday ? 'font-bold' : ''}
            `}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${isToday ? 'text-blue-600' : ''}`}>
                                {format(currentDay, 'd')}
                            </span>
                            {dayAppointments.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                    {dayAppointments.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                                <div
                                    key={apt.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAppointmentClick?.(apt);
                                    }}
                                    className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate hover:bg-blue-200 cursor-pointer"
                                >
                                    {formatTime(apt.jam_janji)} - {apt.patient.nama_lengkap}
                                </div>
                            ))}
                            {dayAppointments.length > 2 && (
                                <div className="text-xs text-gray-600">
                                    +{dayAppointments.length - 2} lainnya
                                </div>
                            )}
                        </div>
                    </button>
                );

                day = addDays(day, 1);
            }
        }

        return days;
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {format(currentMonth, 'MMMM yyyy', { locale: id })}
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        Hari Ini
                    </button>

                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-px mb-1">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            {renderCalendarDays()}
                        </div>
                    </>
                )}
            </div>

            {/* Legend */}
            <div className="px-4 pb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span className="text-gray-600">Ada Janji</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 ring-2 ring-blue-500 rounded"></div>
                    <span className="text-gray-600">Tanggal Dipilih</span>
                </div>
            </div>
        </div>
    );
}