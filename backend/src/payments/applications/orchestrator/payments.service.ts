import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { ProcessPaymentDto } from '../../applications/dto/process-payment.dto'; // Sesuaikan path jika perlu

// Use Cases
import { CreatePaymentUseCase } from '../use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../use-cases/update-payment.use-case';
import { CancelPaymentUseCase } from '../use-cases/cancel-payment.use-case';
import { DeletePaymentUseCase } from '../use-cases/delete-payment.use-case';
import { GetPaymentListUseCase } from '../use-cases/get-payment-list.use-case';
import { GetPaymentDetailUseCase } from '../use-cases/get-payment-detail.use-case';

// Queries & Mappers
import { GetPaymentByInvoiceQuery } from '../../infrastructures/persistence/query/get-payment-by-invoice.query';
import { GetPaymentByMedicalRecordQuery } from '../../infrastructures/persistence/query/get-payment-by-medical-record.query';
import { GetPaymentStatisticsQuery } from '../../infrastructures/persistence/query/get-payment-statistics.query';
import { GetRevenueByPeriodQuery } from '../../infrastructures/persistence/query/get-revenue-by-period.query';
import { GetPaymentsByPatientQuery } from '../../infrastructures/persistence/query/get-payments-by-patient.query';
import { PaymentMapper } from '../../domains/mappers/payment.mapper';
import { PaymentRepository } from '../../infrastructures/persistence/repositories/payment.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
    private readonly getPaymentListUseCase: GetPaymentListUseCase,
    private readonly getPaymentDetailUseCase: GetPaymentDetailUseCase,
    private readonly getPaymentByInvoiceQuery: GetPaymentByInvoiceQuery,
    private readonly getPaymentByMedicalRecordQuery: GetPaymentByMedicalRecordQuery,
    private readonly getPaymentStatisticsQuery: GetPaymentStatisticsQuery,
    private readonly getRevenueByPeriodQuery: GetRevenueByPeriodQuery,
    private readonly getPaymentsByPatientQuery: GetPaymentsByPatientQuery,
    private readonly paymentMapper: PaymentMapper,
    private readonly paymentRepository: PaymentRepository,
  ) { }

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return await this.createPaymentUseCase.execute(dto);
  }

  async findAll(query: QueryPaymentDto) {
    return await this.getPaymentListUseCase.execute(query);
  }

  async findOne(id: number): Promise<PaymentResponseDto> {
    return await this.getPaymentDetailUseCase.execute(id);
  }

  async findByNomorInvoice(nomorInvoice: string): Promise<PaymentResponseDto> {
    const payment = await this.getPaymentByInvoiceQuery.execute(nomorInvoice);
    return this.paymentMapper.toResponseDto(payment);
  }

  async findByMedicalRecordId(medicalRecordId: number): Promise<PaymentResponseDto> {
    const payment = await this.getPaymentByMedicalRecordQuery.execute(medicalRecordId);

    if (!payment) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Pembayaran untuk rekam medis ID ${medicalRecordId} tidak ditemukan`);
    }

    return this.paymentMapper.toResponseDto(payment);
  }

  async findByPatientId(patientId: number, limit: number = 10) {
    const payments = await this.getPaymentsByPatientQuery.execute(patientId, limit);
    return this.paymentMapper.toResponseDtoList(payments);
  }

  async update(id: number, dto: UpdatePaymentDto, updatedBy?: number): Promise<PaymentResponseDto> {
    return await this.updatePaymentUseCase.execute(id, dto, updatedBy);
  }

  async cancel(id: number, cancelledBy?: number): Promise<PaymentResponseDto> {
    return await this.cancelPaymentUseCase.execute(id, cancelledBy);
  }

  async remove(id: number, deletedBy?: number): Promise<void> {
    await this.deletePaymentUseCase.execute(id, deletedBy);
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    return await this.paymentRepository.getTotalRevenue(startDate, endDate);
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    return await this.getPaymentStatisticsQuery.execute(startDate, endDate);
  }

  async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'year' = 'day'
  ) {
    return await this.getRevenueByPeriodQuery.execute(startDate, endDate, groupBy);
  }

  /**
   * Memproses pembayaran (Kasir)
   * Menghitung kembalian dan mengubah status menjadi PAID
   */
  async processPayment(id: number, dto: ProcessPaymentDto, userId: number) {
    // 1. Ambil data payment saat ini
    const payment = await this.findOne(id);

    if (!payment) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }

    // [FIX] Gunakan properti camelCase sesuai DTO Response
    // Cek apakah status sudah lunas
    if (payment.statusPembayaran === 'lunas' || (payment as any).status_pembayaran === 'lunas') {
      throw new BadRequestException('Tagihan ini sudah lunas.');
    }

    // 2. Validasi Nominal
    // [FIX] Gunakan camelCase 'totalAkhir'. Fallback ke snake_case jika mapping belum sempurna.
    const totalTagihan = Number(payment.totalAkhir || (payment as any).total_akhir || 0);
    const uangDiterima = dto.jumlah_bayar;

    if (uangDiterima < totalTagihan) {
      throw new BadRequestException(`Uang kurang! Total: ${totalTagihan}, Diterima: ${uangDiterima}`);
    }

    // 3. Hitung Kembalian
    const kembalian = uangDiterima - totalTagihan;

    // 4. Update Data via Use Case Update
    // Kita gunakan camelCase untuk payload update, asumsi UpdatePaymentDto juga camelCase.
    // Jika nanti error di update, kita ubah jadi snake_case.
    return await this.updatePaymentUseCase.execute(id, {
      statusPembayaran: 'lunas',      // camelCase
      jumlahBayar: uangDiterima,      // camelCase
      kembalian: kembalian,           // camelCase
      metodePembayaran: dto.metode_pembayaran, // camelCase
      tanggalPembayaran: new Date(),  // camelCase
      updatedBy: userId,              // camelCase
      keterangan: dto.keterangan
    } as any);
  }
}