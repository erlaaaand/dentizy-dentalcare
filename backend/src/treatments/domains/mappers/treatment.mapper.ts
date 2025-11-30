// backend/src/treatments/applications/mappers/treatment.mapper.ts
import { Injectable } from '@nestjs/common';
import { Treatment } from '../../domains/entities/treatments.entity';
import { TreatmentResponseDto } from '../../applications/dto/treatment-response.dto';
import { CreateTreatmentDto } from '../../applications/dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../../applications/dto/update-treatment.dto';
import { TreatmentListResponseDto } from '../../applications/dto/treatment-list-response.dto';

@Injectable()
export class TreatmentMapper {
    toResponseDto(treatment: Treatment): TreatmentResponseDto {
        return new TreatmentResponseDto({
            id: treatment.id,
            categoryId: treatment.categoryId,
            kodePerawatan: treatment.kodePerawatan,
            namaPerawatan: treatment.namaPerawatan,
            deskripsi: treatment.deskripsi,
            harga: treatment.harga,
            durasiEstimasi: treatment.durasiEstimasi,
            isActive: treatment.isActive,
            createdAt: treatment.createdAt,
            updatedAt: treatment.updatedAt,
            category: treatment.category
                ? {
                    id: treatment.category.id,
                    namaKategori: treatment.category.namaKategori,
                }
                : undefined,
        });
    }

    toListResponseDto(treatment: Treatment): TreatmentListResponseDto {
        return {
            id: treatment.id,
            kodePerawatan: treatment.kodePerawatan,
            namaPerawatan: treatment.namaPerawatan,
            harga: treatment.harga,
            durasiEstimasi: treatment.durasiEstimasi,
            isActive: treatment.isActive,
            categoryName: treatment.category?.namaKategori,
        };
    }

    toEntity(dto: CreateTreatmentDto): Partial<Treatment> {
        return {
            categoryId: dto.categoryId,
            namaPerawatan: dto.namaPerawatan,
            deskripsi: dto.deskripsi,
            harga: dto.harga,
            durasiEstimasi: dto.durasiEstimasi,
            isActive: dto.isActive ?? true,
        };
    }

    toUpdateEntity(dto: UpdateTreatmentDto): Partial<Treatment> {
        const updateData: Partial<Treatment> = {};

        if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
        if (dto.namaPerawatan !== undefined) updateData.namaPerawatan = dto.namaPerawatan;
        if (dto.deskripsi !== undefined) updateData.deskripsi = dto.deskripsi;
        if (dto.harga !== undefined) updateData.harga = dto.harga;
        if (dto.durasiEstimasi !== undefined) updateData.durasiEstimasi = dto.durasiEstimasi;
        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

        return updateData;
    }

    toResponseDtoList(treatments: Treatment[]): TreatmentResponseDto[] {
        return treatments.map((treatment) => this.toResponseDto(treatment));
    }

    toListResponseDtoList(treatments: Treatment[]): TreatmentListResponseDto[] {
        return treatments.map((treatment) => this.toListResponseDto(treatment));
    }
}