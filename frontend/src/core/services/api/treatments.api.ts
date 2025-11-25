// frontend/src/core/services/api/treatments.api.ts

// 1. Import dengan ALIAS (Renaming)
import {
    // Hooks
    useTreatmentsControllerFindAll as useTreatments,
    useTreatmentsControllerFindOne as useTreatment,
    useTreatmentsControllerFindByKode as useTreatmentByKode,
    useTreatmentsControllerCreate as useCreateTreatment,
    useTreatmentsControllerUpdate as useUpdateTreatment,
    useTreatmentsControllerRemove as useDeleteTreatment,
    useTreatmentsControllerRestore as useRestoreTreatment,
    useTreatmentsControllerActivate as useActivateTreatment,
    useTreatmentsControllerDeactivate as useDeactivateTreatment,

    // API Functions (Non-Hook)
    treatmentsControllerFindAll as getTreatments,
    treatmentsControllerFindOne as getTreatment,
    treatmentsControllerFindByKode as getTreatmentByKode,
    treatmentsControllerCreate as createTreatment,
    treatmentsControllerUpdate as updateTreatment,
    treatmentsControllerRemove as deleteTreatment,
    treatmentsControllerRestore as restoreTreatment,
    treatmentsControllerActivate as activateTreatment,
    treatmentsControllerDeactivate as deactivateTreatment,

    // Query Keys
    getTreatmentsControllerFindAllQueryKey as getTreatmentsQueryKey,
    getTreatmentsControllerFindOneQueryKey as getTreatmentQueryKey,
    getTreatmentsControllerFindByKodeQueryKey as getTreatmentByKodeQueryKey,

} from '@/core/api/generated/treatments/treatments';

// 2. Export Alias yang Lebih Pendek
export {
    // Hooks
    useTreatments,
    useTreatment,
    useTreatmentByKode,
    useCreateTreatment,
    useUpdateTreatment,
    useDeleteTreatment,
    useRestoreTreatment,
    useActivateTreatment,
    useDeactivateTreatment,

    // API Functions
    getTreatments,
    getTreatment,
    getTreatmentByKode,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    restoreTreatment,
    activateTreatment,
    deactivateTreatment,

    // Query Keys
    getTreatmentsQueryKey,
    getTreatmentQueryKey,
    getTreatmentByKodeQueryKey,
};

export type {
    TreatmentDetailDto,
    TreatmentResponseDto,
    TreatmentsControllerFindAllParams,
    TreatmentsControllerFindAllSortBy,
    TreatmentsControllerFindAllSortOrder,
    CreateTreatmentDto,
    UpdateTreatmentDto,
    PaginatedTreatmentResponseDto,
} from '@/core/api/model';
