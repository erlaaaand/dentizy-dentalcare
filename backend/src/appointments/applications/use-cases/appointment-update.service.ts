import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../../domains/entities/appointment.entity';
import { AppointmentsRepository } from '../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentValidator } from '../../domains/validators/appointment.validator';
import { AppointmentTimeValidator } from '../../domains/validators/appointment-time.validator';
import { AppointmentConflictValidator } from '../../domains/validators/appointment-conflict.validator';
import { AppointmentDomainService } from '../../domains/services/appointment-domain.service';
import { TransactionManager } from '../../infrastructures/transactions/transaction.manager';
import { AppointmentUpdatedEvent } from '../../infrastructures/events';

/**
 * Use Case: Update Appointment
 * Update appointment dengan validasi conflict jika waktu berubah
 */
@Injectable()
export class AppointmentUpdateService {
  private readonly logger = new Logger(AppointmentUpdateService.name);

  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly validator: AppointmentValidator,
    private readonly timeValidator: AppointmentTimeValidator,
    private readonly conflictValidator: AppointmentConflictValidator,
    private readonly domainService: AppointmentDomainService,
    private readonly transactionManager: TransactionManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Execute: Update appointment
   */
  async execute(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
    const queryRunner = this.repository.createQueryRunner();

    try {
      const appointment = await this.transactionManager.executeInTransaction(
        queryRunner,
        async (qr) => {
          // 1. FIND APPOINTMENT
          const appointment = await this.repository.findByIdInTransaction(
            qr,
            id,
          );
          this.validator.validateAppointmentExists(appointment, id);

          // 2. VALIDASI: Status untuk update
          this.validator.validateStatusForUpdate(appointment!);

          // 3. VALIDASI WAKTU (jika waktu diupdate)
          const isTimeUpdated = this.domainService.isTimeUpdated(dto);

          if (isTimeUpdated) {
            const tanggalJanji = dto.tanggal_janji
              ? new Date(dto.tanggal_janji)
              : appointment!.tanggal_janji;

            const jamJanji = dto.jam_janji || appointment!.jam_janji;

            // Validasi tanggal & jam kerja
            if (dto.tanggal_janji) {
              this.timeValidator.validateDateNotInPast(tanggalJanji);
            }
            if (dto.jam_janji) {
              this.timeValidator.validateWorkingHours(jamJanji);
            }

            // Validasi conflict (exclude appointment yang sedang diupdate)
            const appointmentDate = new Date(tanggalJanji);
            appointmentDate.setHours(0, 0, 0, 0);

            const { bufferStart, bufferEnd } =
              this.timeValidator.calculateBufferWindow(
                appointmentDate,
                jamJanji,
              );

            await this.conflictValidator.validateNoConflictForUpdate(
              qr,
              id,
              appointment!.doctor_id,
              appointmentDate,
              jamJanji,
              bufferStart,
              bufferEnd,
            );
          }

          // 4. UPDATE APPOINTMENT
          const updatedAppointment = this.domainService.updateAppointmentEntity(
            appointment!,
            dto,
          );

          return await this.repository.updateInTransaction(
            qr,
            updatedAppointment,
          );
        },
        'update-appointment',
      );

      // 5. EMIT EVENT
      const isTimeUpdated = this.domainService.isTimeUpdated(dto);

      this.eventEmitter.emit(
        'appointment.updated',
        new AppointmentUpdatedEvent(appointment, isTimeUpdated),
      );

      this.logger.log(`🔄 Appointment #${id} updated`);

      return appointment;
    } catch (error) {
      this.logger.error(`❌ Error updating appointment ID ${id}:`, error.stack);
      throw error;
    }
  }
}
