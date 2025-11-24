// backend/src/treatment-categories/interface/http/dto/update-treatment-category.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTreatmentCategoryDto } from './create-treatment-category.dto';

export class UpdateTreatmentCategoryDto extends PartialType(CreateTreatmentCategoryDto) { }