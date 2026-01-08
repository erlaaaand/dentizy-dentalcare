// backend/src/treatments/applications/use-cases/create-treatment.use-case.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TreatmentRepository } from '../../infrastructures/persistence/repositories/treatment.repository';
import { TreatmentCategoryRepository } from '../../../treatment-categories/infrastructures/persistence/repositories/treatment-category.repository';
import { CreateTreatmentDto } from '../dto/create-treatment.dto';
import { TreatmentResponseDto } from '../dto/treatment-response.dto';
import { TreatmentMapper } from '../../domains/mappers/treatment.mapper';
import { TreatmentValidationService } from '../../domains/services/treatment-validation.service';
import { TreatmentCreatedEvent } from '../../infrastructures/events/treatment-created.event';
import { TreatmentsIdGenerator } from '../../infrastructures/generator/treatments-id.generator';

@Injectable()
export class CreateTreatmentUseCase {
  constructor(
    private readonly treatmentRepository: TreatmentRepository,
    private readonly categoryRepository: TreatmentCategoryRepository,
    private readonly treatmentMapper: TreatmentMapper,
    private readonly validationService: TreatmentValidationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly idGenerator: TreatmentsIdGenerator,
  ) {}

  async execute(dto: CreateTreatmentDto): Promise<TreatmentResponseDto> {
    // Validate business rules
    const newKode = await this.idGenerator.generateKodePerawatan();

    const treatmentData = {
      ...dto,
      kodePerawatan: newKode,
    };

    // 3. Validate business rules (Menggunakan treatmentData yang sudah ada kodenya)
    const validation = this.validationService.validateTreatmentData({
      kodePerawatan: treatmentData.kodePerawatan,
      namaPerawatan: treatmentData.namaPerawatan,
      harga: treatmentData.harga,
    });

    if (!validation.isValid) {
      throw new ConflictException(validation.errors.join(', '));
    }

    // Check category exists
    const categoryExists = await this.categoryRepository.exists(dto.categoryId);
    if (!categoryExists) {
      throw new NotFoundException(
        `Kategori dengan ID ${dto.categoryId} tidak ditemukan`,
      );
    }

    // Create treatment
    const treatment = await this.treatmentRepository.create(
      treatmentData as any,
    );

    // Emit event
    this.eventEmitter.emit(
      'treatment.created',
      new TreatmentCreatedEvent(
        treatment.id,
        treatment.kodePerawatan,
        treatment.namaPerawatan,
        treatment.categoryId,
        treatment.harga,
        treatment.createdAt,
      ),
    );

    return this.treatmentMapper.toResponseDto(treatment);
  }
}
