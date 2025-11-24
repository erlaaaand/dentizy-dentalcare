// backend/src/payments/applications/orchestrator/payments.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentRepository } from '../../infrastructures/persistence/repositories/payment.repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { StatusPembayaran } from '../../domains/entities/payments.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Check if payment already exists for this medical record
    const existingPayment = await this.paymentRepository.findByMedicalRecordId(dto.medicalRecordId);
    if (existingPayment) {
      throw new ConflictException(`Pembayaran untuk rekam medis ID ${dto.medicalRecordId} sudah ada`);
    }

    // Validate payment amount
    const totalAkhir = dto.totalBiaya - (dto.diskonTotal || 0);
    if (dto.jumlahBayar < totalAkhir) {
      // Set status as partial payment
      dto.statusPembayaran = StatusPembayaran.SEBAGIAN;
    } else {
      // Set status as paid
      dto.statusPembayaran = StatusPembayaran.LUNAS;
    }

    try {
      const payment = await this.paymentRepository.create(dto);
      return new PaymentResponseDto(payment);
    } catch (error) {
      throw new BadRequestException('Gagal membuat pembayaran');
    }
  }

  async findAll(query: QueryPaymentDto) {
    const { data, total } = await this.paymentRepository.findAll(query);
    const { page = 1, limit = 10 } = query;

    return {
      data: data.map((item) => new PaymentResponseDto(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    }

    return new PaymentResponseDto(payment);
  }

  async findByNomorInvoice(nomorInvoice: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByNomorInvoice(nomorInvoice);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran dengan nomor invoice ${nomorInvoice} tidak ditemukan`);
    }

    return new PaymentResponseDto(payment);
  }

  async findByMedicalRecordId(medicalRecordId: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByMedicalRecordId(medicalRecordId);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran untuk rekam medis ID ${medicalRecordId} tidak ditemukan`);
    }

    return new PaymentResponseDto(payment);
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    }

    // Prevent updating if payment is already cancelled
    if (payment.statusPembayaran === StatusPembayaran.DIBATALKAN) {
      throw new BadRequestException('Pembayaran yang sudah dibatalkan tidak dapat diubah');
    }

    // Recalculate status if payment amount changed
    if (dto.jumlahBayar !== undefined || dto.totalBiaya !== undefined || dto.diskonTotal !== undefined) {
      const totalBiaya = dto.totalBiaya ?? payment.totalBiaya;
      const diskonTotal = dto.diskonTotal ?? payment.diskonTotal;
      const jumlahBayar = dto.jumlahBayar ?? payment.jumlahBayar;
      const totalAkhir = totalBiaya - diskonTotal;

      if (jumlahBayar < totalAkhir) {
        dto.statusPembayaran = StatusPembayaran.SEBAGIAN;
      } else {
        dto.statusPembayaran = StatusPembayaran.LUNAS;
      }
    }

    try {
      const updatedPayment = await this.paymentRepository.update(id, dto);
      return new PaymentResponseDto(updatedPayment);
    } catch (error) {
      throw new BadRequestException('Gagal mengupdate pembayaran');
    }
  }

  async cancel(id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    }

    if (payment.statusPembayaran === StatusPembayaran.DIBATALKAN) {
      throw new BadRequestException('Pembayaran sudah dibatalkan');
    }

    const updatedPayment = await this.paymentRepository.update(id, {
      statusPembayaran: StatusPembayaran.DIBATALKAN,
    });

    return new PaymentResponseDto(updatedPayment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.paymentRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    }

    await this.paymentRepository.softDelete(id);
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    return await this.paymentRepository.getTotalRevenue(startDate, endDate);
  }
}