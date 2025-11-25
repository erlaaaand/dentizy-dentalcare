// frontend/src/core/services/api/medical-record-treatments.api.ts

import {
    // --- Hooks (Untuk React Component) ---
    useMedicalRecordTreatmentsControllerCreate as useCreateMedicalRecordTreatment,
    useMedicalRecordTreatmentsControllerFindAll as useMedicalRecordTreatments,
    useMedicalRecordTreatmentsControllerFindByMedicalRecordId as useMedicalRecordTreatmentsByRecordId,
    useMedicalRecordTreatmentsControllerGetTotalByMedicalRecordId as useMedicalRecordTreatmentTotal,
    useMedicalRecordTreatmentsControllerFindOne as useMedicalRecordTreatment,
    useMedicalRecordTreatmentsControllerUpdate as useUpdateMedicalRecordTreatment,
    useMedicalRecordTreatmentsControllerRemove as useDeleteMedicalRecordTreatment,

    // --- API Functions (Untuk penggunaan manual non-hook) ---
    medicalRecordTreatmentsControllerCreate as createMedicalRecordTreatment,
    medicalRecordTreatmentsControllerFindAll as getMedicalRecordTreatments,
    medicalRecordTreatmentsControllerFindByMedicalRecordId as getMedicalRecordTreatmentsByRecordId,
    medicalRecordTreatmentsControllerGetTotalByMedicalRecordId as getMedicalRecordTreatmentTotal,
    medicalRecordTreatmentsControllerFindOne as getMedicalRecordTreatment,
    medicalRecordTreatmentsControllerUpdate as updateMedicalRecordTreatment,
    medicalRecordTreatmentsControllerRemove as deleteMedicalRecordTreatment,

    // --- Query Keys (Untuk invalidasi cache) ---
    getMedicalRecordTreatmentsControllerFindAllQueryKey as getMedicalRecordTreatmentsQueryKey,
    getMedicalRecordTreatmentsControllerFindByMedicalRecordIdQueryKey as getMedicalRecordTreatmentsByRecordIdQueryKey,
    getMedicalRecordTreatmentsControllerGetTotalByMedicalRecordIdQueryKey as getMedicalRecordTreatmentTotalQueryKey,
    getMedicalRecordTreatmentsControllerFindOneQueryKey as getMedicalRecordTreatmentQueryKey,

} from '@/core/api/generated/medical-record-treatments/medical-record-treatments'; // Pastikan path sesuai hasil generate

// Export Alias
export {
    // Hooks
    useCreateMedicalRecordTreatment,
    useMedicalRecordTreatments,
    useMedicalRecordTreatmentsByRecordId,
    useMedicalRecordTreatmentTotal,
    useMedicalRecordTreatment,
    useUpdateMedicalRecordTreatment,
    useDeleteMedicalRecordTreatment,

    // API Functions
    createMedicalRecordTreatment,
    getMedicalRecordTreatments,
    getMedicalRecordTreatmentsByRecordId,
    getMedicalRecordTreatmentTotal,
    getMedicalRecordTreatment,
    updateMedicalRecordTreatment,
    deleteMedicalRecordTreatment,

    // Query Keys
    getMedicalRecordTreatmentsQueryKey,
    getMedicalRecordTreatmentsByRecordIdQueryKey,
    getMedicalRecordTreatmentTotalQueryKey,
    getMedicalRecordTreatmentQueryKey,
};

// Export Types (Model terkait)
export type {
    CreateMedicalRecordTreatmentDto,
    UpdateMedicalRecordTreatmentDto,
    MedicalRecordTreatmentResponseDto,
    MedicalRecordTreatmentsControllerFindAllParams,
    // Response untuk Total Biaya (misal: { total: 100000 })
    MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200 as MedicalRecordTreatmentTotalResponse,

    // Jika ada tipe data spesifik di dalamnya (biasanya properti 'data' jika dibungkus)
    MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200Data as MedicalRecordTreatmentTotalData,

    // Response saat Delete (misal: { success: true })
    MedicalRecordTreatmentsControllerRemove200 as MedicalRecordTreatmentRemoveResponse,
} from '@/core/api/model';