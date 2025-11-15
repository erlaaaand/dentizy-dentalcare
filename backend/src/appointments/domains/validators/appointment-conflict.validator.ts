import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { Brackets, QueryRunner } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

/**
 * Validator untuk deteksi konflik jadwal appointment
 */
@Injectable()
export class AppointmentConflictValidator {
    private readonly logger = new Logger(AppointmentConflictValidator.name);
    private readonly BUFFER_MINUTES = 30;

    /**
     * Cek konflik jadwal dengan buffer time (30 menit)
     * Menggunakan pessimistic lock untuk mencegah race condition
     */
    async validateNoConflict(
        queryRunner: QueryRunner,
        doctorId: number,
        tanggalJanji: Date,
        jamJanji: string,
        bufferStart: string,
        bufferEnd: string
    ): Promise<void> {
        this.logger.debug(`Checking conflict for doctor #${doctorId} at ${jamJanji}`);
        this.logger.debug(`Buffer window: ${bufferStart} - ${bufferEnd}`);

        const conflictingAppointment = await queryRunner.manager
            .createQueryBuilder(Appointment, 'appointment')
            .where('appointment.doctor_id = :doctorId', { doctorId })
            .andWhere('appointment.tanggal_janji = :tanggalJanji', { tanggalJanji })
            .andWhere('appointment.status = :status', { status: AppointmentStatus.DIJADWALKAN })
            .andWhere(
                new Brackets((qb) => {
                    // Check if new appointment overlaps with existing ones
                    qb.where('appointment.jam_janji BETWEEN :bufferStart AND :bufferEnd', {
                        bufferStart,
                        bufferEnd,
                    })
                        // OR if existing appointment overlaps with new one
                        .orWhere(
                            `TIME_TO_SEC(appointment.jam_janji) - TIME_TO_SEC(:requestedTime) 
                             BETWEEN -1800 AND 1800`,
                            { requestedTime: jamJanji }
                        );
                })
            )
            .setLock('pessimistic_write') // Lock untuk prevent race condition
            .getOne();

        if (conflictingAppointment) {
            throw new ConflictException(
                `Dokter sudah memiliki janji temu di waktu yang berdekatan (${conflictingAppointment.jam_janji}). ` +
                `Silakan pilih waktu minimal ${this.BUFFER_MINUTES} menit sebelum atau sesudah.`
            );
        }

        this.logger.debug('✅ No conflict found');
    }

    /**
     * Cek konflik untuk update appointment
     * Exclude appointment yang sedang diupdate
     */
    async validateNoConflictForUpdate(
        queryRunner: QueryRunner,
        appointmentId: number,
        doctorId: number,
        tanggalJanji: Date,
        jamJanji: string,
        bufferStart: string,
        bufferEnd: string
    ): Promise<void> {
        const conflictingAppointment = await queryRunner.manager
            .createQueryBuilder(Appointment, 'appointment')
            .where('appointment.id != :appointmentId', { appointmentId })
            .andWhere('appointment.doctor_id = :doctorId', { doctorId })
            .andWhere('appointment.tanggal_janji = :tanggalJanji', { tanggalJanji })
            .andWhere('appointment.status = :status', { status: AppointmentStatus.DIJADWALKAN })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('appointment.jam_janji BETWEEN :bufferStart AND :bufferEnd', {
                        bufferStart,
                        bufferEnd,
                    })
                        .orWhere(
                            `TIME_TO_SEC(appointment.jam_janji) - TIME_TO_SEC(:requestedTime) 
                             BETWEEN -1800 AND 1800`,
                            { requestedTime: jamJanji }
                        );
                })
            )
            .setLock('pessimistic_write')
            .getOne();

        if (conflictingAppointment) {
            throw new ConflictException(
                `Dokter sudah memiliki janji temu di waktu yang berdekatan (${conflictingAppointment.jam_janji}). ` +
                `Silakan pilih waktu minimal ${this.BUFFER_MINUTES} menit sebelum atau sesudah.`
            );
        }
    }
}