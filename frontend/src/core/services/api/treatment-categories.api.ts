// frontend/src/core/services/api/treatment-categories.api.ts

import {
    // --- Hooks (Untuk digunakan di React Component) ---
    useTreatmentCategoriesControllerFindAll as useTreatmentCategories,
    useTreatmentCategoriesControllerFindOne as useTreatmentCategory,
    useTreatmentCategoriesControllerCreate as useCreateTreatmentCategory,
    useTreatmentCategoriesControllerUpdate as useUpdateTreatmentCategory,
    useTreatmentCategoriesControllerRemove as useDeleteTreatmentCategory,
    useTreatmentCategoriesControllerRestore as useRestoreTreatmentCategory,

    // --- API Functions (Untuk penggunaan manual non-hook) ---
    treatmentCategoriesControllerFindAll as getTreatmentCategories,
    treatmentCategoriesControllerFindOne as getTreatmentCategory,
    treatmentCategoriesControllerCreate as createTreatmentCategory,
    treatmentCategoriesControllerUpdate as updateTreatmentCategory,
    treatmentCategoriesControllerRemove as deleteTreatmentCategory,
    treatmentCategoriesControllerRestore as restoreTreatmentCategory,

    // --- Query Keys (Berguna untuk invalidasi cache) ---
    getTreatmentCategoriesControllerFindAllQueryKey as getTreatmentCategoriesQueryKey,
    getTreatmentCategoriesControllerFindOneQueryKey as getTreatmentCategoryQueryKey,

} from '@/core/api/generated/treatment-categories/treatment-categories'; // Pastikan path ini sesuai dengan hasil generate

// Export Alias yang Lebih Pendek
export {
    // Hooks
    useTreatmentCategories,
    useTreatmentCategory,
    useCreateTreatmentCategory,
    useUpdateTreatmentCategory,
    useDeleteTreatmentCategory,
    useRestoreTreatmentCategory,

    // API Functions
    getTreatmentCategories,
    getTreatmentCategory,
    createTreatmentCategory,
    updateTreatmentCategory,
    deleteTreatmentCategory,
    restoreTreatmentCategory,

    // Query Keys
    getTreatmentCategoriesQueryKey,
    getTreatmentCategoryQueryKey,
};

// Export Types (Model terkait kategori)
export type {
    CreateTreatmentCategoryDto,
    UpdateTreatmentCategoryDto,
    TreatmentCategoryResponseDto,
    TreatmentCategoriesControllerFindAllParams,
    CategoryInfoDto,
} from '@/core/api/model';