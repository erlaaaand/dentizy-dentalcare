import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DataSource, DeepPartial, QueryRunner } from 'typeorm';

// DTOs
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../dto/find-appointments-query.dto';
import {
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
} from '../dto/appointment-response.dto';

// Entities
import { User } from '../../../users/domains/entities/user.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../domains/entities/appointment.entity';
import { MedicalRecord } from '../../../medical_records/domains/entities/medical-record.entity';
import { MedicalRecordTreatment } from '../../../medical-record-treatments/domains/entities/medical-record-treatments.entity';
import {
  Payment,
  MetodePembayaran,
  StatusPembayaran,
} from '../../../payments/domains/entities/payments.entity';

// Use Cases
import { AppointmentCreationService } from '../use-cases/appointment-creation.service';
import { AppointmentCompletionService } from '../use-cases/appointment-completion.service';
import { AppointmentCancellationService } from '../use-cases/appointment-cancellation.service';
import { AppointmentFindService } from '../use-cases/appointment-find.service';
import { AppointmentSearchService } from '../use-cases/appointment-search.service';
import { AppointmentUpdateService } from '../use-cases/appointment-update.service';
import { AppointmentDeletionService } from '../use-cases/appointment-deletion.service';
import { AppointmentMapper } from '../../domains/mappers/appointment.mapper';

// Service External
import { TreatmentsService } from '../../../treatments/applications/orchestrator/treatments.service';

/**
 * Interface untuk Medical Record creation payload
 */
interface MedicalRecordCreationData {
  appointment_id: number;
  doctor_id: number;
  patient_id: number;
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}

/**
 * Interface untuk Medical Record Treatment creation
 */
interface MedicalRecordTreatmentCreationData {
  medicalRecord: MedicalRecord;
  treatmentId: number;
  jumlah: number;
  hargaSatuan: number;
  diskon: number;
  subtotal: number;
  total: number;
  keterangan: string;
}

/**
 * Interface untuk Payment creation
 */
interface PaymentCreationData {
  medicalRecordId: number;
  patientId: number;
  nomorInvoice: string;
  tanggalPembayaran: string;
  totalBiaya: number;
  diskonTotal: number;
  totalAkhir: number;
  jumlahBayar: number;
  kembalian: number;
  metodePembayaran: string;
  statusPembayaran: string;
  keterangan: string;
  createdBy: number;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly creationService: AppointmentCreationService,
    private readonly completionService: AppointmentCompletionService,
    private readonly cancellationService: AppointmentCancellationService,
    private readonly findService: AppointmentFindService,
    private readonly searchService: AppointmentSearchService,
    private readonly updateService: AppointmentUpdateService,
    private readonly deletionService: AppointmentDeletionService,
    private readonly mapper: AppointmentMapper,
    private readonly treatmentsService: TreatmentsService,
  ) {}

  // --- Standard Methods ---
  async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.creationService.execute(dto);
    return this.mapper.toResponseDto(appointment);
  }

  async complete(id: number, user: User): Promise<AppointmentResponseDto> {
    const appointment = await this.completionService.execute(id, user);
    return this.mapper.toResponseDto(appointment);
  }

  async cancel(id: number, user: User): Promise<AppointmentResponseDto> {
    const appointment = await this.cancellationService.execute(id, user);
    return this.mapper.toResponseDto(appointment);
  }

  async findAll(
    user: User,
    queryDto: FindAppointmentsQueryDto,
  ): Promise<PaginatedAppointmentResponseDto> {
    const result = await this.searchService.execute(user, queryDto);
    return this.mapper.toPaginatedResponse(
      result.data,
      result.count,
      result.page,
      result.limit,
    );
  }

  async findOne(id: number, user: User): Promise<AppointmentResponseDto> {
    const appointment = await this.findService.execute(id, user);
    return this.mapper.toResponseDto(appointment);
  }

  async update(
    id: number,
    dto: UpdateAppointmentDto,
    user?: User,
  ): Promise<AppointmentResponseDto> {
    if (
      dto.status === AppointmentStatus.SELESAI &&
      dto.medical_record &&
      user
    ) {
      return this.handleCompletionWithMedicalRecord(id, dto, user);
    }
    const appointment = await this.updateService.execute(id, dto);
    return this.mapper.toResponseDto(appointment);
  }

  async remove(id: number, user: User): Promise<void> {
    await this.deletionService.execute(id, user);
  }

  // --- PRIVATE METHODS (FULL DIRECT TRANSACTION) ---

  private async handleCompletionWithMedicalRecord(
    id: number,
    dto: UpdateAppointmentDto,
    user: User,
  ): Promise<AppointmentResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Fetch Appointment with relations
      const existingAppt = await this.findAppointmentInTransaction(
        queryRunner,
        id,
      );

      // 2. Validate status
      this.validateAppointmentForCompletion(existingAppt);

      // 3. Create Medical Record
      const savedMedicalRecord = await this.createMedicalRecord(
        queryRunner,
        id,
        existingAppt,
        dto,
      );

      // 4. Process Treatments and Calculate Total
      const totalAmount = await this.processTreatments(
        queryRunner,
        savedMedicalRecord,
        dto.medical_record?.treatment_ids || [],
      );

      // 5. Create Payment
      await this.createPayment(
        queryRunner,
        savedMedicalRecord.id,
        existingAppt,
        totalAmount,
        user.id,
      );

      // 6. Update Appointment Status
      const updatedAppt = await this.updateAppointmentStatus(
        queryRunner,
        existingAppt,
        dto,
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ Appointment #${id} completed with medical record and payment`,
      );

      return this.mapper.toResponseDto(updatedAppt);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Transaction Error in handleCompletionWithMedicalRecord:',
        error instanceof Error ? error.stack : 'Unknown error',
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Gagal memproses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find appointment in transaction
   */
  private async findAppointmentInTransaction(
    queryRunner: QueryRunner,
    id: number,
  ): Promise<Appointment> {
    const appointment = await queryRunner.manager.findOne(Appointment, {
      where: { id },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment tidak ditemukan');
    }

    return appointment;
  }

  /**
   * Validate appointment can be completed
   */
  private validateAppointmentForCompletion(appointment: Appointment): void {
    if (appointment.status === AppointmentStatus.SELESAI) {
      throw new ConflictException('Appointment ini sudah berstatus SELESAI.');
    }
  }

  /**
   * Create medical record
   */
  private async createMedicalRecord(
    queryRunner: QueryRunner,
    appointmentId: number,
    appointment: Appointment,
    dto: UpdateAppointmentDto,
  ): Promise<MedicalRecord> {
    const medicalRecordData: MedicalRecordCreationData = {
      appointment_id: appointmentId,
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      subjektif: dto.medical_record?.subjektif,
      objektif: dto.medical_record?.objektif,
      assessment: dto.medical_record?.assessment,
      plan: dto.medical_record?.plan,
    };

    const medicalRecord = queryRunner.manager.create(
      MedicalRecord,
      medicalRecordData,
    );

    return await queryRunner.manager.save(medicalRecord);
  }

  /**
   * Process treatments and calculate total amount
   */
  private async processTreatments(
    queryRunner: QueryRunner,
    medicalRecord: MedicalRecord,
    treatmentIds: number[],
  ): Promise<number> {
    let totalAmount = 0;

    if (treatmentIds.length === 0) {
      return totalAmount;
    }

    for (const treatmentId of treatmentIds) {
      try {
        const treatmentMaster =
          await this.treatmentsService.findOne(treatmentId);
        const hargaFix = treatmentMaster.harga
          ? Number(treatmentMaster.harga)
          : 0;

        // Calculate amounts
        const qty = 1;
        const subtotal = hargaFix * qty;
        const diskon = 0;
        const total = subtotal - diskon;

        // Create treatment record data
        const treatmentData: MedicalRecordTreatmentCreationData = {
          medicalRecord: medicalRecord,
          treatmentId: treatmentId,
          jumlah: qty,
          hargaSatuan: hargaFix,
          diskon: diskon,
          subtotal: subtotal,
          total: total,
          keterangan: '',
        };

        const mrt = queryRunner.manager.create(
          MedicalRecordTreatment,
          treatmentData,
        );
        await queryRunner.manager.save(mrt);

        totalAmount += total;
      } catch (error) {
        this.logger.error(
          `Failed to process treatment ${treatmentId}:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
        throw new BadRequestException(
          `Treatment dengan ID ${treatmentId} tidak valid`,
        );
      }
    }

    return isNaN(totalAmount) ? 0 : totalAmount;
  }

  /**
   * Create payment record
   */
  private async createPayment(
    queryRunner: QueryRunner,
    medicalRecordId: number,
    appointment: Appointment,
    totalAmount: number,
    userId: number,
  ): Promise<Payment> {
    const paymentData: DeepPartial<Payment> = {
      medicalRecordId: medicalRecordId,
      patientId: appointment.patient_id,
      nomorInvoice: `INV/${Date.now()}`,

      tanggalPembayaran: new Date(),

      totalBiaya: totalAmount,
      diskonTotal: 0,
      totalAkhir: totalAmount,
      jumlahBayar: 0,
      kembalian: 0,

      metodePembayaran: MetodePembayaran.TUNAI,
      statusPembayaran: StatusPembayaran.PENDING,
      keterangan: `Kunjungan tgl ${appointment.tanggal_janji}`,
      createdBy: userId,
    };

    const payment = queryRunner.manager.create(Payment, paymentData);
    return await queryRunner.manager.save(payment);
  }

  /**
   * Update appointment status to completed
   */
  private async updateAppointmentStatus(
    queryRunner: QueryRunner,
    appointment: Appointment,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    appointment.status = AppointmentStatus.SELESAI;
    if (dto.jam_janji) {
      appointment.jam_janji = dto.jam_janji;
    }

    return await queryRunner.manager.save(appointment);
  }
}
