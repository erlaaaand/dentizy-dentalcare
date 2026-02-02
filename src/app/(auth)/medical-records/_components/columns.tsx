"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, CalendarDays, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { Button } from "@/src/components/dashboard-ui/components/button"
import { Badge } from "@/src/components/dashboard-ui/components/badge"
import type { MedicalRecordResponseDto } from "./types"

interface ColumnProps {
  onView: (data: MedicalRecordResponseDto) => void
  showDoctorColumn?: boolean
}

// Helper Format Rupiah
const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export const getColumns = ({ onView, showDoctorColumn = true }: ColumnProps): ColumnDef<MedicalRecordResponseDto>[] => {
  const columns: ColumnDef<MedicalRecordResponseDto>[] = [
    {
      accessorKey: "created_at",
      header: "Tanggal Periksa",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              {date ? format(new Date(date), "dd MMM yyyy", { locale: localeId }) : "-"}
            </div>
            <span className="text-xs text-muted-foreground ml-5">
              {date ? format(new Date(date), "HH:mm", { locale: localeId }) : ""} WIB
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "patient",
      header: "Pasien",
      cell: ({ row }) => {
        const patient = row.original.patient
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{patient?.nama_lengkap ?? "Tanpa Nama"}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {patient?.nomor_rekam_medis ?? "-"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "assessment",
      header: "Diagnosa",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground italic" title={row.getValue("assessment")}>
          {row.getValue("assessment") || "-"}
        </div>
      ),
    },
    {
      id: "total_cost",
      header: "Total Biaya",
      cell: ({ row }) => {
        const treatments = row.original.medical_record_treatments || []
        
        const total = treatments.reduce((sum, item) => {
          // Priority: Price Snapshot -> Master Price -> 0
          const price = Number(item.price_snapshot ?? item.treatment?.harga ?? 0)
          const qty = Number(item.jumlah ?? 1)
          return sum + (price * qty)
        }, 0)

        return (
          <Badge variant="outline" className="font-mono font-medium text-green-700 bg-green-50 border-green-200">
            {formatRp(total)}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={() => onView(row.original)}
        >
          <Eye className="size-4 mr-2" /> Detail
        </Button>
      ),
    },
  ]

  // Sisipkan kolom dokter jika diperlukan (misal untuk view Kepala Klinik)
  if (showDoctorColumn) {
    columns.splice(2, 0, {
      accessorKey: "doctor",
      header: "Dokter",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1 rounded-full">
            <Stethoscope className="size-3 text-blue-600" />
          </div>
          <span className="text-sm">{row.original.doctor?.nama_lengkap ?? "-"}</span>
        </div>
      ),
    })
  }

  return columns
}