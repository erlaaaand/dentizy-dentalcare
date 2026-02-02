import type { 
  TreatmentResponseDto,
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentDetailDto,
  TreatmentSubsetDto,
  PaginatedTreatmentResponseDto,
  TreatmentsControllerFindAllParams,
  TreatmentsControllerFindAllSortBy,
  TreatmentsControllerFindAllSortOrder
} from '../../api/model';

// Re-export all DTOs
export type { 
  TreatmentResponseDto, 
  CreateTreatmentDto, 
  UpdateTreatmentDto,
  TreatmentDetailDto,
  TreatmentSubsetDto,
  PaginatedTreatmentResponseDto,
  TreatmentsControllerFindAllSortBy,
  TreatmentsControllerFindAllSortOrder
};

// Alias types
export type Treatment = TreatmentResponseDto;
export type TreatmentQueryParams = TreatmentsControllerFindAllParams;
export type PaginatedTreatmentResponse = PaginatedTreatmentResponseDto;