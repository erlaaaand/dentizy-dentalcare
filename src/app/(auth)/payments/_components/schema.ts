import { z } from "zod"
import { ProcessPaymentDtoMetodePembayaran } from "@/src/core/api/model"

export const paymentProcessSchema = z.object({
  jumlahBayar: z
    .number()
    .min(1, { message: "Jumlah bayar tidak boleh 0" }),

  metodePembayaran: z.enum(
    Object.values(ProcessPaymentDtoMetodePembayaran) as [
      "tunai",
      "transfer",
      "kartu_kredit",
      "kartu_debit",
      "qris"
    ],
    {
      message: "Metode pembayaran wajib dipilih",
    }
  ),

  keterangan: z.string().optional(),
})

export type PaymentProcessFormValues = z.infer<typeof paymentProcessSchema>
