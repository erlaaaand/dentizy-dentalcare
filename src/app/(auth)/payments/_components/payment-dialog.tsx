"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Receipt, Calculator, Printer } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/src/components/dashboard-ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/dialog/dialog"
import { Input } from "@/src/components/dashboard-ui/components/input"
import { Label } from "@/src/components/dashboard-ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/dashboard-ui/components/select"

import { PaymentApi } from "@/src/core/service/api/payments/payments.api"
import { paymentProcessSchema, type PaymentProcessFormValues } from "./schema"
import { 
  type PaymentResponseDto, 
  type StrictProcessPaymentDto,
  ProcessPaymentDtoMetodePembayaran,
  type ProcessPaymentDto 
} from "./types"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PaymentResponseDto | null
  readOnly?: boolean
}

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatInputNumber = (val: string) => {
  if (!val) return ""
  return new Intl.NumberFormat("id-ID").format(Number(val.replace(/\D/g, "")))
}

export function PaymentDialog({
  open,
  onOpenChange,
  data,
  readOnly = false,
}: PaymentDialogProps) {
  const queryClient = useQueryClient()
  const [displayAmount, setDisplayAmount] = useState("")

  const totalBill = useMemo(() => {
    // Akses properti DTO langsung tanpa 'any'
    return data?.totalAkhir ?? 0
  }, [data])

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentProcessFormValues>({
    resolver: zodResolver(paymentProcessSchema),
    defaultValues: {
      jumlahBayar: 0,
      metodePembayaran: ProcessPaymentDtoMetodePembayaran.tunai,
      keterangan: "",
    },
  })

  const amountPaid = watch("jumlahBayar")
  const change = amountPaid - totalBill
  const isSufficient = amountPaid >= totalBill

  useEffect(() => {
    if (open && data) {
      if (readOnly) {
        // Mode ReadOnly: Ambil dari data response
        const paid = data.jumlahBayar ?? 0
        setValue("jumlahBayar", paid)
        setDisplayAmount(formatInputNumber(paid.toString()))
        
        // Casting string response ke Enum jika perlu
        setValue("metodePembayaran", data.metodePembayaran as ProcessPaymentDtoMetodePembayaran)
        setValue("keterangan", data.keterangan ?? "")
      } else {
        // Mode Pembayaran: Reset
        reset({
          jumlahBayar: 0,
          metodePembayaran: ProcessPaymentDtoMetodePembayaran.tunai,
          keterangan: "",
        })
        setDisplayAmount("")
      }
    }
  }, [open, data, readOnly, reset, setValue])

  const processMutation = useMutation({
    mutationFn: (payload: StrictProcessPaymentDto) => {
      // NOTE: PaymentResponseDto ID adalah string (UUID), 
      // tapi generated Controller Payment (payments.ts) meminta 'id: number'.
      // Kita lakukan konversi Number() disini. Jika backend sebenarnya support UUID string,
      // generated code perlu diupdate. Untuk saat ini kita ikuti generated code.
      return PaymentApi.process(Number(data!.id), payload as unknown as ProcessPaymentDto)
    },
    onSuccess: () => {
      toast.success("Pembayaran berhasil!")
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      onOpenChange(false)
    },
    onError: () => toast.error("Gagal memproses pembayaran"),
  })

  const onSubmit = (values: PaymentProcessFormValues) => {
    if (!isSufficient) {
      toast.error("Uang yang dibayarkan kurang!")
      return
    }
    processMutation.mutate(values)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "")
    setDisplayAmount(formatInputNumber(rawVal))
    setValue("jumlahBayar", Number(rawVal), { shouldValidate: true })
  }

  const handleExactMoney = () => {
    setDisplayAmount(formatInputNumber(totalBill.toString()))
    setValue("jumlahBayar", totalBill, { shouldValidate: true })
  }

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{readOnly ? "Detail Transaksi" : "Kasir & Pembayaran"}</DialogTitle>
          <DialogDescription>
            Invoice <span className="font-mono font-bold">#{data.nomorInvoice || data.id.substring(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          
          <div className={`p-6 rounded-lg text-primary-foreground shadow-sm text-center ${
            readOnly ? "bg-slate-600" : "bg-primary"
          }`}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-90 mb-1">Total Tagihan</p>
            <h2 className="text-4xl font-bold tracking-tight">{formatRp(totalBill)}</h2>
            <p className="text-sm mt-2 opacity-90 font-medium">
              Pasien: {data.patient?.nama_lengkap ?? "Umum"}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Uang Diterima</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">Rp</span>
                <Input 
                  id="amount"
                  className="pl-10 text-lg font-bold h-12"
                  placeholder="0"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  disabled={readOnly || processMutation.isPending}
                  autoFocus={!readOnly}
                />
              </div>
              {errors.jumlahBayar && <p className="text-xs text-destructive">{errors.jumlahBayar.message}</p>}
              
              {!readOnly && (
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-7 text-xs"
                    onClick={handleExactMoney}
                  >
                    Uang Pas ({formatRp(totalBill)})
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Controller
                  control={control}
                  name="metodePembayaran"
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={readOnly || processMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Metode" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProcessPaymentDtoMetodePembayaran).map((method) => (
                          <SelectItem key={method} value={method}>
                            <span className="capitalize">{method.replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.metodePembayaran && <p className="text-xs text-destructive">{errors.metodePembayaran.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Controller
                  control={control}
                  name="keterangan"
                  render={({ field }) => (
                    <Input 
                      placeholder="Opsional..." 
                      {...field} 
                      disabled={readOnly || processMutation.isPending}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 border-dashed flex justify-between items-center transition-colors ${
            isSufficient ? "bg-green-50 border-green-200 text-green-800" : "bg-muted/30 border-muted text-muted-foreground"
          }`}>
            <span className="font-semibold flex items-center gap-2 text-sm">
              <Calculator className="size-4" /> Kembalian
            </span>
            <span className="text-2xl font-bold">
              {isSufficient ? formatRp(change) : "-"}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processMutation.isPending}>
              {readOnly ? "Tutup" : "Batal"}
            </Button>

            {!readOnly ? (
              <Button 
                type="submit" 
                disabled={!isSufficient || processMutation.isPending}
                className="w-full sm:w-auto"
              >
                {processMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!processMutation.isPending && <Receipt className="mr-2 h-4 w-4" />}
                Proses Bayar
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => toast.info("Fitur cetak akan segera hadir")}>
                <Printer className="mr-2 h-4 w-4" /> Cetak Struk
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}