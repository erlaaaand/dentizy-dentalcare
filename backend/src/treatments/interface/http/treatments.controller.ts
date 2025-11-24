// backend/src/treatments/interface/http/treatments.controller.ts
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
import { TreatmentsService } from '../../applications/orchestrator/treatments.service';
import { CreateTreatmentDto } from '../../applications/dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../../applications/dto/update-treatment.dto';
import { QueryTreatmentDto } from '../../applications/dto/query-treatment.dto';

@Controller('treatments')
export class TreatmentsController {
    constructor(private readonly treatmentsService: TreatmentsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateTreatmentDto) {
        const data = await this.treatmentsService.create(createDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Perawatan berhasil dibuat',
            data,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryTreatmentDto) {
        const result = await this.treatmentsService.findAll(query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan berhasil diambil',
            ...result,
        };
    }

    @Get('kode/:kode')
    @HttpCode(HttpStatus.OK)
    async findByKode(@Param('kode') kode: string) {
        const data = await this.treatmentsService.findByKode(kode);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan berhasil diambil',
            data,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.treatmentsService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data perawatan berhasil diambil',
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTreatmentDto,
    ) {
        const data = await this.treatmentsService.update(id, updateDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Perawatan berhasil diupdate',
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.treatmentsService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Perawatan berhasil dihapus',
        };
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    async restore(@Param('id', ParseIntPipe) id: number) {
        const data = await this.treatmentsService.restore(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Perawatan berhasil dipulihkan',
            data,
        };
    }
}