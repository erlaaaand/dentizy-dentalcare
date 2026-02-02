import { z } from "zod"

export const userFormSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Minimal pilih satu role"),
})

export type UserFormValues = z.infer<typeof userFormSchema>