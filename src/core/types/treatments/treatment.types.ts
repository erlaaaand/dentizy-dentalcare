import type { 
  TreatmentResponseDto,
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentsControllerFindAllParams
} from '../../api/model';

export type { TreatmentResponseDto, CreateTreatmentDto, UpdateTreatmentDto };
export type Treatment = TreatmentResponseDto;
export type TreatmentQueryParams = TreatmentsControllerFindAllParams;