import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Validator untuk waktu appointment (tanggal & jam)
 */
@Injectable()
export class AppointmentTimeValidator {
    private readonly WORKING_HOURS_START = 8; // 08:00
    private readonly WORKING_HOURS_END = 17; // 17:00
    private readonly LAST_APPOINTMENT_HOUR = 16; // 16:xx
    private readonly LAST_APPOINTMENT_MINUTE = 30; // xx:30

    /**
     * Validasi tanggal tidak boleh di masa lalu
     */
    validateDateNotInPast(tanggalJanji: string | Date): void {
        const appointmentDate = new Date(tanggalJanji);
        appointmentDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            throw new BadRequestException('Tanggal janji temu tidak boleh di masa lalu');
        }
    }

    /**
     * Validasi jam kerja klinik (08:00 - 16:30)
     */
    validateWorkingHours(jamJanji: string): void {
        const [hours, minutes] = jamJanji.split(':').map(Number);

        if (
            hours < this.WORKING_HOURS_START ||
            hours >= this.WORKING_HOURS_END ||
            (hours === this.LAST_APPOINTMENT_HOUR && minutes > this.LAST_APPOINTMENT_MINUTE)
        ) {
            throw new BadRequestException(
                `Jam janji harus antara ${this.WORKING_HOURS_START}:00 - ${this.LAST_APPOINTMENT_HOUR}:${this.LAST_APPOINTMENT_MINUTE}`
            );
        }
    }

    /**
     * Format time string dari Date object
     */
    formatTimeString(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Hitung buffer time window untuk conflict detection
     */
    calculateBufferWindow(
        tanggalJanji: Date,
        jamJanji: string,
        bufferMinutes: number = 30
    ): { bufferStart: string; bufferEnd: string; appointmentDateTime: Date } {
        const [hours, minutes, seconds = 0] = jamJanji.split(':').map(Number);

        const appointmentDateTime = new Date(tanggalJanji);
        appointmentDateTime.setHours(hours, minutes, seconds, 0);

        const bufferStartDate = new Date(appointmentDateTime.getTime() - bufferMinutes * 60 * 1000);
        const bufferEndDate = new Date(appointmentDateTime.getTime() + bufferMinutes * 60 * 1000);

        return {
            bufferStart: this.formatTimeString(bufferStartDate),
            bufferEnd: this.formatTimeString(bufferEndDate),
            appointmentDateTime,
        };
    }

    /**
     * Cek apakah dua waktu memiliki konflik
     */
    hasTimeConflict(time1: string, time2: string, bufferMinutes: number = 30): boolean {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);

        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;

        const diff = Math.abs(minutes1 - minutes2);

        return diff < bufferMinutes;
    }

    /**
     * Validasi komprehensif untuk create appointment
     */
    validateAppointmentTime(tanggalJanji: string | Date, jamJanji: string): void {
        this.validateDateNotInPast(tanggalJanji);
        this.validateWorkingHours(jamJanji);
    }
}