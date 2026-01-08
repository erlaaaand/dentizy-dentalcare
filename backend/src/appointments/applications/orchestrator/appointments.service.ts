import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

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
import { Payment } from '../../../payments/domains/entities/payments.entity';

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

@Injectable()
export class AppointmentsService {
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
      // 1. Ambil Appointment
      const existingAppt = await queryRunner.manager.findOne(Appointment, {
        where: { id },
        relations: ['patient'],
      });

      if (!existingAppt)
        throw new NotFoundException('Appointment tidak ditemukan');

      if (existingAppt.status === AppointmentStatus.SELESAI) {
        // Untuk ID 10, jika sudah SELESAI, Anda harus reset statusnya di DB dulu
        throw new ConflictException('Appointment ini sudah berstatus SELESAI.');
      }

      // 2. Buat Medical Record
      const medicalRecord = queryRunner.manager.create(MedicalRecord, {
        appointment_id: id,
        doctor_id: existingAppt.doctor_id,
        patient_id: existingAppt.patient_id,
        subjektif: dto.medical_record?.subjektif,
        objektif: dto.medical_record?.objektif,
        assessment: dto.medical_record?.assessment,
        plan: dto.medical_record?.plan,
      });
      const savedMedicalRecord = await queryRunner.manager.save(medicalRecord);

      // 3. Proses Treatments & Hitung Harga
      let totalAmount = 0;
      const treatmentIds = dto.medical_record?.treatment_ids || [];

      if (treatmentIds.length > 0) {
        for (const treatmentId of treatmentIds) {
          const treatmentMaster =
            await this.treatmentsService.findOne(treatmentId);
          const hargaFix = treatmentMaster.harga
            ? Number(treatmentMaster.harga)
            : 0;

          // [FIX] Hitung Subtotal & Total
          const qty = 1;
          const subtotal = hargaFix * qty;
          const diskon = 0;
          const total = subtotal - diskon;

          // Simpan Detail dengan Subtotal & Total
          const mrt = queryRunner.manager.create(MedicalRecordTreatment, {
            medicalRecord: savedMedicalRecord,
            treatmentId: treatmentId,
            jumlah: qty,
            hargaSatuan: hargaFix,
            diskon: diskon,

            // [FIX] Tambahkan field wajib ini
            subtotal: subtotal,
            total: total,

            keterangan: '',
          } as any);
          await queryRunner.manager.save(mrt);

          totalAmount += total;
        }
      }

      if (isNaN(totalAmount)) totalAmount = 0;

      // 4. Buat Payment
      const payment = queryRunner.manager.create(Payment, {
        medicalRecordId: savedMedicalRecord.id,
        patientId: existingAppt.patient_id,

        nomorInvoice: `INV/${Date.now()}`,
        tanggalPembayaran: new Date().toISOString(),

        totalBiaya: totalAmount,
        diskonTotal: 0,
        totalAkhir: totalAmount,

        jumlahBayar: 0,
        kembalian: 0,

        metodePembayaran: 'tunai',
        statusPembayaran: 'pending',

        keterangan: `Kunjungan tgl ${existingAppt.tanggal_janji}`,
        createdBy: user.id,
      } as any);

      await queryRunner.manager.save(payment);

      // 5. Update Status Appointment
      existingAppt.status = AppointmentStatus.SELESAI;
      if (dto.jam_janji) existingAppt.jam_janji = dto.jam_janji;

      const updatedAppt = await queryRunner.manager.save(existingAppt);

      await queryRunner.commitTransaction();

      return this.mapper.toResponseDto(updatedAppt);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction Error:', error);

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Gagal memproses: ${(error as any).message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
