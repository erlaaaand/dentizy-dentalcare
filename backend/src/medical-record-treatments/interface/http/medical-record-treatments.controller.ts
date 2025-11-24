// backend/src/medical-record-treatments/interface/http/medical-record-treatments.controller.ts
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
import { MedicalRecordTreatmentsService } from '../../applications/orchestrator/medical-record-treatments.service';
import { CreateMedicalRecordTreatmentDto } from '../../applications/dto/create-medical-record-treatment.dto';
import { UpdateMedicalRecordTreatmentDto } from '../../applications/dto/update-medical-record-treatment.dto';
import { QueryMedicalRecordTreatmentDto } from '../../applications/dto/query-medical-record-treatment.dto';

@Controller('medical-record-treatments')
export class MedicalRecordTreatmentsController {
    constructor(
        private readonly medicalRecordTreatmentsService: MedicalRecordTreatmentsService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateMedicalRecordTreatmentDto) {
        const data = await this.medicalRecordTreatmentsService.create(createDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Perawatan berhasil ditambahkan ke rekam medis',
            data,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryMedicalRecordTreatmentDto) {
        const result = await this.medicalRecordTreatmentsService.findAll(query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan rekam medis berhasil diambil',
            ...result,
        };
    }

    @Get('medical-record/:medicalRecordId')
    @HttpCode(HttpStatus.OK)
    async findByMedicalRecordId(
        @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    ) {
        const data = await this.medicalRecordTreatmentsService.findByMedicalRecordId(medicalRecordId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan rekam medis berhasil diambil',
            data,
        };
    }

    @Get('medical-record/:medicalRecordId/total')
    @HttpCode(HttpStatus.OK)
    async getTotalByMedicalRecordId(
        @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    ) {
        const total = await this.medicalRecordTreatmentsService.getTotalByMedicalRecordId(medicalRecordId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Total biaya perawatan berhasil dihitung',
            data: { total },
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.medicalRecordTreatmentsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan rekam medis berhasil diambil',
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateMedicalRecordTreatmentDto,
    ) {
        const data = await this.medicalRecordTreatmentsService.update(id, updateDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Perawatan rekam medis berhasil diupdate',
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.medicalRecordTreatmentsService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Perawatan rekam medis berhasil dihapus',
        };
    }
}