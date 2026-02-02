"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Eye, CreditCard, CheckCircle2, Clock, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { Button } from "@/src/components/dashboard-ui/components/button"
import { Badge } from "@/src/components/dashboard-ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/components/dashboard-ui/components/dropdown-menu"

import { 
  type PaymentResponseDto, 
  PaymentsControllerFindAllStatusPembayaran 
} from "./types"

interface ColumnProps {
  onProcess: (data: PaymentResponseDto) => void
  onView: (data: PaymentResponseDto) => void
}

const formatRp = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export const getColumns = ({ onProcess, onView }: ColumnProps): ColumnDef<PaymentResponseDto>[] => [
  {
    accessorKey: "nomorInvoice",
    header: "Invoice",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-xs text-muted-foreground">
        {/* Fallback ke ID jika nomorInvoice kosong */}
        {row.original.nomorInvoice || `#${row.original.id.substring(0, 8).toUpperCase()}`}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = row.original.createdAt
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date ? format(new Date(date), "dd MMM yyyy", { locale: localeId }) : "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            {date ? format(new Date(date), "HH:mm", { locale: localeId }) : ""} WIB
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "patient",
    header: "Pasien",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.patient?.nama_lengkap ?? "Umum"}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.patient?.nomor_rekam_medis ?? "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalAkhir",
    header: "Total Tagihan",
    cell: ({ row }) => {
      // Menggunakan properti asli dari DTO tanpa 'as any'
      const total = row.original.totalAkhir ?? 0
      return (
        <span className="font-bold text-sm">
          {formatRp(total)}
        </span>
      )
    },
  },
  {
    accessorKey: "statusPembayaran",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.statusPembayaran
      const isLunas = status === PaymentsControllerFindAllStatusPembayaran.lunas
      
      return isLunas ? (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
          <CheckCircle2 className="size-3" /> Lunas
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" /> Menunggu
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
      const isPending = payment.statusPembayaran === PaymentsControllerFindAllStatusPembayaran.pending

      return (
        <div className="flex items-center gap-2">
          {isPending ? (
            <Button 
              size="sm" 
              className="h-8 shadow-sm"
              onClick={() => onProcess(payment)}
            >
              <CreditCard className="size-3 mr-2" /> Bayar
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8"
              onClick={() => onView(payment)}
            >
              <Eye className="size-3 mr-2" /> Detail
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi Lain</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
                Salin ID Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]