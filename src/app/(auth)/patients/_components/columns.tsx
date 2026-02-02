"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Phone, CalendarDays, Trash2, Edit } from "lucide-react"
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
import { type PatientResponseDto, PatientResponseDtoJenisKelamin } from "./types"

interface ColumnProps {
  onEdit: (data: PatientResponseDto) => void
  onDelete: (data: PatientResponseDto) => void
  canManage: boolean
}

export const getColumns = ({ onEdit, onDelete, canManage }: ColumnProps): ColumnDef<PatientResponseDto>[] => [
  {
    accessorKey: "nomor_rekam_medis",
    header: "No. RM",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
        {row.getValue("nomor_rekam_medis")}
      </Badge>
    ),
  },
  {
    accessorKey: "nama_lengkap",
    header: "Pasien",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.getValue("nama_lengkap")}</span>
        <span className="text-xs text-muted-foreground">NIK: {row.original.nik || "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "jenis_kelamin",
    header: "L/P",
    cell: ({ row }) => {
      const jk = row.getValue("jenis_kelamin") as PatientResponseDtoJenisKelamin
      return (
        <Badge variant={jk === PatientResponseDtoJenisKelamin.L ? "secondary" : "outline"} className="text-[10px]">
          {jk === PatientResponseDtoJenisKelamin.L ? "Laki-laki" : "Perempuan"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "no_hp",
    header: "Kontak",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="size-3" />
        <span>{row.getValue("no_hp") || "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "tanggal_lahir",
    header: "Tgl Lahir",
    cell: ({ row }) => {
      const date = row.getValue("tanggal_lahir") as string
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-3" />
          <span>{date ? format(new Date(date), "dd MMM yyyy", { locale: localeId }) : "-"}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.nomor_rekam_medis)}>
              Salin Rekam Medis Pasien
            </DropdownMenuItem>
            
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(patient)}>
                  <Edit className="mr-2 size-3" /> Edit Data
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(patient)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-3" /> Hapus Pasien
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]