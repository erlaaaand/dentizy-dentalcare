"use client"

import { useMemo } from "react"
import { 
  User, 
  Stethoscope, 
  Calendar, 
  Receipt, 
  Pill, 
  AlertCircle 
} from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { Button } from "@/src/components/dashboard-ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/dialog/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/dashboard-ui/components/table"

import type { MedicalRecordResponseDto } from "./types"

interface RecordDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MedicalRecordResponseDto | null
}

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export function RecordDetailDialog({
  open,
  onOpenChange,
  data,
}: RecordDetailDialogProps) {
  
  const treatments = data?.medical_record_treatments || []

  const totalBiaya = useMemo(() => {
    return treatments.reduce((sum, item) => {
      const harga = Number(item.price_snapshot ?? item.treatment?.harga ?? 0)
      const qty = Number(item.jumlah ?? 1)
      return sum + (harga * qty)
    }, 0)
  }, [treatments])

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Rekam Medis</DialogTitle>
          <DialogDescription>
            ID Referensi: <span className="font-mono text-xs">{data.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          
          {/* 1. Header Info: Pasien & Dokter */}
          <div className="bg-muted/30 p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4">
            {/* Pasien */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full mt-1">
                <User className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Pasien</p>
                <h4 className="font-bold text-sm">{data.patient?.nama_lengkap ?? "Unknown"}</h4>
                <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border mt-1 inline-block">
                  {data.patient?.nomor_rekam_medis ?? "-"}
                </span>
              </div>
            </div>

            {/* Dokter */}
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full mt-1">
                <Stethoscope className="size-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Dokter</p>
                <h4 className="font-semibold text-sm">{data.doctor?.nama_lengkap ?? "-"}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="size-3" />
                  {data.created_at ? format(new Date(data.created_at), 'dd MMM yyyy, HH:mm', { locale: localeId }) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SOAP Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 pl-3 py-1 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-r text-sm">
                <h5 className="font-semibold text-xs uppercase mb-1 text-yellow-700 dark:text-yellow-400">Subjective (Keluhan)</h5>
                <p className="whitespace-pre-wrap text-muted-foreground">{data.subjektif || '-'}</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-r text-sm">
                <h5 className="font-semibold text-xs uppercase mb-1 text-blue-700 dark:text-blue-400">Objective (Pemeriksaan)</h5>
                <p className="whitespace-pre-wrap text-muted-foreground">{data.objektif || '-'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-3 py-1 bg-red-50/50 dark:bg-red-900/10 rounded-r text-sm">
                <h5 className="font-semibold text-xs uppercase mb-1 text-red-700 dark:text-red-400">Assessment (Diagnosa)</h5>
                <p className="font-medium text-foreground whitespace-pre-wrap">{data.assessment || '-'}</p>
              </div>
              <div className="border-l-4 border-green-400 pl-3 py-1 bg-green-50/50 dark:bg-green-900/10 rounded-r text-sm">
                <h5 className="font-semibold text-xs uppercase mb-1 text-green-700 dark:text-green-400">Plan (Resep/Instruksi)</h5>
                <p className="whitespace-pre-wrap text-muted-foreground">{data.plan || '-'}</p>
              </div>
            </div>
          </div>

          {/* 3. Tabel Rincian Biaya */}
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Rincian Tindakan & Biaya</h3>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Tindakan</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.length > 0 ? (
                  treatments.map((item, idx) => {
                    // Gunakan harga snapshot (harga saat transaksi) atau harga master
                    const price = Number(item.price_snapshot ?? item.treatment?.harga ?? 0)
                    return (
                      <TableRow key={idx}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Pill className="size-3 text-primary" />
                            <span className="text-sm">{item.treatment?.namaPerawatan ?? "Item Terhapus"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono py-2">
                          {formatRp(price)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <AlertCircle className="size-4" />
                        <span>Tidak ada tindakan tercatat.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-t">
              <span className="font-semibold text-sm">Total Biaya</span>
              <span className="font-bold font-mono text-base text-primary">
                {formatRp(totalBiaya)}
              </span>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}