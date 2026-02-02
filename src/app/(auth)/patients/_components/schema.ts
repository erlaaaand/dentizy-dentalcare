import { z } from "zod"
import { PatientResponseDtoJenisKelamin } from "@/src/core/api/model"

export const patientFormSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),

  nik: z
    .string()
    .min(16, "NIK harus 16 digit")
    .max(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka")
    .optional()
    .or(z.literal("")),

  no_hp: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true

      const digits = val.replace(/\D/g, "")

      let normalized = digits
      if (digits.startsWith("0")) normalized = "62" + digits.slice(1)
      else if (digits.startsWith("8")) normalized = "62" + digits

      return /^62\d{9,12}$/.test(normalized)
    }, "Nomor HP tidak valid (format Indonesia)"),


  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),

  alamat: z.string().optional(),

  jenis_kelamin: z
    .nativeEnum(PatientResponseDtoJenisKelamin)
    .refine((v) => v !== undefined && v !== null, {
      message: "Pilih jenis kelamin",
    }),

  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
