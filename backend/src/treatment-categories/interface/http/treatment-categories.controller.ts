// backend/src/treatment-categories/interface/http/treatment-categories.controller.ts
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
import { TreatmentCategoriesService } from '../../applications/orchestrator/treatment-categories.service';
import { CreateTreatmentCategoryDto } from '../../applications/dto/create-treatment-category.dto';
import { UpdateTreatmentCategoryDto } from '../../applications/dto/update-treatment-category.dto';
import { QueryTreatmentCategoryDto } from '../../applications/dto/query-treatment-category.dto';

@Controller('treatment-categories')
export class TreatmentCategoriesController {
    constructor(
        private readonly treatmentCategoriesService: TreatmentCategoriesService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateTreatmentCategoryDto) {
        const data = await this.treatmentCategoriesService.create(createDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Kategori perawatan berhasil dibuat',
            data,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: QueryTreatmentCategoryDto) {
        const result = await this.treatmentCategoriesService.findAll(query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data kategori perawatan berhasil diambil',
            ...result,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.treatmentCategoriesService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Data kategori perawatan berhasil diambil',
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTreatmentCategoryDto,
    ) {
        const data = await this.treatmentCategoriesService.update(id, updateDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Kategori perawatan berhasil diupdate',
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.treatmentCategoriesService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Kategori perawatan berhasil dihapus',
        };
    }

    @Patch(':id/restore')
    @HttpCode(HttpStatus.OK)
    async restore(@Param('id', ParseIntPipe) id: number) {
        const data = await this.treatmentCategoriesService.restore(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Kategori perawatan berhasil dipulihkan',
            data,
        };
    }
}