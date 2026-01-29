"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Clock, CalendarDays, Stethoscope } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { Button } from "@/src/components/dashboard-ui/components/button"
import { Badge } from "@/src/components/dashboard-ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/dashboard-ui/components/dropdown-menu"
import { AppointmentResponseDto, AppointmentResponseDtoStatus } from "./types"

interface ColumnProps {
  onEdit: (data: AppointmentResponseDto) => void
  onCancel: (data: AppointmentResponseDto) => void
}

export const getColumns = ({ onEdit, onCancel }: ColumnProps): ColumnDef<AppointmentResponseDto>[] => [
  {
    accessorKey: "tanggal_janji",
    header: "Waktu Kunjungan",
    cell: ({ row }) => {
      const date = row.getValue("tanggal_janji") as string
      const time = row.original.jam_janji
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            {date ? format(new Date(date), "dd MMM yyyy", { locale: localeId }) : "-"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {time?.substring(0, 5)} WIB
          </div>
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
    accessorKey: "doctor",
    header: "Dokter",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1 rounded-full">
          <Stethoscope className="size-3 text-primary" />
        </div>
        <span className="text-sm">{row.original.doctor?.nama_lengkap ?? "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
      let label = status as string

      switch (status) {
        case AppointmentResponseDtoStatus.dijadwalkan:
          variant = "outline"
          break
        case AppointmentResponseDtoStatus.selesai:
          variant = "default"
          break
        case AppointmentResponseDtoStatus.dibatalkan:
          variant = "destructive"
          break
        case AppointmentResponseDtoStatus.menunggu_konfirmasi:
          variant = "secondary"
          label = "Menunggu Konfirmasi"
          break
      }

      return (
        <Badge variant={variant} className="capitalize">
          {label.replace(/_/g, " ")}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original
      const isEditable =
        appointment.status !== AppointmentResponseDtoStatus.selesai &&
        appointment.status !== AppointmentResponseDtoStatus.dibatalkan

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(appointment.id))}>
              Salin ID Jadwal
            </DropdownMenuItem>
            {isEditable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(appointment)}>Ubah Jadwal</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCancel(appointment)}
                  className="text-destructive focus:text-destructive"
                >
                  Batalkan Janji
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]