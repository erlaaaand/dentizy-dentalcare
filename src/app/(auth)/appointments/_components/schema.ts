import { z } from "zod"
import { AppointmentResponseDtoStatus } from "@/src/core/api/model"

export const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, "Pasien wajib dipilih"),
  doctor_id: z.string().min(1, "Dokter wajib dipilih"),
  tanggal_janji: z.string().min(1, "Tanggal wajib diisi"),
  jam_janji: z.string().min(1, "Jam wajib diisi"),
  keluhan: z.string().optional(),
  status: z.nativeEnum(AppointmentResponseDtoStatus).optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>