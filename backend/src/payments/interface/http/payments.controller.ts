// backend/src/payments/interface/http/payments.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { PaymentsService } from '../../applications/orchestrator/payments.service';
import { CreatePaymentDto } from '../../applications/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../applications/dto/update-payment.dto';
import { QueryPaymentDto } from '../../applications/dto/query-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreatePaymentDto) {
        const data = await this.paymentsService.create(createDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Pembayaran berhasil dibuat',
            data,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryPaymentDto) {
        const result = await this.paymentsService.findAll(query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data pembayaran berhasil diambil',
            ...result,
        };
    }

    @Get('invoice/:nomorInvoice')
    @HttpCode(HttpStatus.OK)
    async findByNomorInvoice(@Param('nomorInvoice') nomorInvoice: string) {
        const data = await this.paymentsService.findByNomorInvoice(nomorInvoice);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data pembayaran berhasil diambil',
            data,
        };
    }

    @Get('medical-record/:medicalRecordId')
    @HttpCode(HttpStatus.OK)
    async findByMedicalRecordId(
        @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    ) {
        const data = await this.paymentsService.findByMedicalRecordId(medicalRecordId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data pembayaran berhasil diambil',
            data,
        };
    }

    @Get('revenue')
    @HttpCode(HttpStatus.OK)
    async getTotalRevenue(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        const total = await this.paymentsService.getTotalRevenue(start, end);
        return {
            statusCode: HttpStatus.OK,
            message: 'Total pendapatan berhasil dihitung',
            data: { total, startDate: start, endDate: end },
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.paymentsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data pembayaran berhasil diambil',
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdatePaymentDto,
    ) {
        const data = await this.paymentsService.update(id, updateDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Pembayaran berhasil diupdate',
            data,
        };
    }

    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(@Param('id', ParseIntPipe) id: number) {
        const data = await this.paymentsService.cancel(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Pembayaran berhasil dibatalkan',
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.paymentsService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Pembayaran berhasil dihapus',
        };
    }
}