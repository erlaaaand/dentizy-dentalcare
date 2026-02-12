"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/src/core/utils/classnames/cn.utils"
import { useDebounce } from "@/src/core/hooks/utils/useDebounce"
import { useUsers } from "@/src/core/hooks/users/useUsers"
import { usePatients } from "@/src/core/hooks/patients/usePatients"

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
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/dashboard-ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/dashboard-ui/components/popover"

import { appointmentFormSchema, type AppointmentFormValues } from "./schema"
import {
  type AppointmentResponseDto,
  type CreateAppointmentDto,
  type UpdateAppointmentDto,
} from "@/src/core/types/appointments/appointment.types"
import type { UserResponseDto } from "@/src/core/types/users/user.types"
import type { PatientResponseDto } from "@/src/core/types/patients/patient.types"

// Helper type for payload
export type AppointmentPayload = CreateAppointmentDto | UpdateAppointmentDto

// Interface for API Paginated Response (matches what backend returns)
interface ApiPaginatedResponse<T> {
  data: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  // Include other possible properties if backend structure varies
  count?: number
  totalPages?: number
}

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AppointmentResponseDto | null
  onSuccess: (data: AppointmentPayload) => void
  isSubmitting?: boolean
}

export function AppointmentDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  isSubmitting = false,
}: AppointmentDialogProps) {
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false)
  const [searchPatient, setSearchPatient] = useState("")
  // Mencegah debounce berjalan saat dialog tertutup
  const debouncedSearchPatient = useDebounce(searchPatient, 500)

  // 1. Fetch Pasien (Searchable via usePatients)
  // usePatients returns PatientPaginatedResponse which has data: PatientResponseDto[]
  const { data: consumersResponse, isLoading: loadingPatients } = usePatients({
    page: 1,
    limit: 10,
    search: debouncedSearchPatient || undefined,
  })

  // consumersResponse is already typed as PatientPaginatedResponse
  const patientsData: PatientResponseDto[] = consumersResponse?.data || []

  // 2. Fetch Dokter
  const { data: doctorsResponse, isLoading: loadingDoctors } = useUsers({
    limit: 100,
  })

  // Cast doctorsResponse to expected shape since useUsers returns unknown
  // We filter by roles 'dokter' or 'kepala_klinik'
  const doctorsData = ((doctorsResponse as ApiPaginatedResponse<UserResponseDto>)?.data || []).filter((u: UserResponseDto) =>
    u.roles?.some((r) => ["dokter", "kepala_klinik"].includes(r.name.toLowerCase()))
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: "",
      doctor_id: "",
      tanggal_janji: new Date().toISOString().split("T")[0],
      jam_janji: "",
      keluhan: "",
      status: "dijadwalkan",
    },
  })

  // Reset form saat dialog dibuka atau initialData berubah
  useEffect(() => {
    if (!open) return

    if (initialData) {
      reset({
        patient_id: String(initialData.patient_id),
        doctor_id: String(initialData.doctor_id),
        tanggal_janji: initialData.tanggal_janji,
        jam_janji: initialData.jam_janji,
        keluhan: initialData.keluhan || "",
        status: initialData.status,
      })
    } else {
      reset({
        patient_id: "",
        doctor_id: "",
        tanggal_janji: new Date().toISOString().split("T")[0],
        jam_janji: "",
        keluhan: "",
        status: "dijadwalkan",
      })
    }
  }, [open, initialData, reset])

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchPatient("")
    }
    onOpenChange(isOpen)
  }

  const onSubmit = (values: AppointmentFormValues) => {
    // Pastikan format jam HH:mm:ss
    const formattedTime = values.jam_janji.length === 5 ? `${values.jam_janji}:00` : values.jam_janji

    if (initialData) {
      const updatePayload: UpdateAppointmentDto = {
        doctor_id: String(values.doctor_id),
        tanggal_janji: values.tanggal_janji,
        jam_janji: formattedTime,
        keluhan: values.keluhan,
        status: values.status,
      }
      onSuccess(updatePayload)
    } else {
      const createPayload: CreateAppointmentDto = {
        patient_id: String(values.patient_id),
        doctor_id: String(values.doctor_id),
        tanggal_janji: values.tanggal_janji,
        jam_janji: formattedTime,
        keluhan: values.keluhan,
      }
      onSuccess(createPayload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-150 overflow-visible">
        <DialogHeader>
          <DialogTitle>{initialData ? "Ubah Jadwal" : "Buat Jadwal Baru"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Perbarui informasi kunjungan pasien."
              : "Isi detail untuk membuat janji temu baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">

            {/* --- PASIEN (COMBOBOX) --- */}
            <div className="space-y-2 flex flex-col">
              <Label>Pasien</Label>
              <Controller
                name="patient_id"
                control={control}
                render={({ field }) => (
                  <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPatientCombobox}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!!initialData} // Tidak bisa ganti pasien saat edit
                      >
                        {field.value
                          ? patientsData.find((p) => String(p.id) === field.value)?.nama_lengkap ||
                          (initialData?.patient_id === String(field.value)
                            ? initialData.patient?.nama_lengkap
                            : "Pasien Terpilih")
                          : "Cari Pasien..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-70 p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Ketik nama atau No. RM..."
                          value={searchPatient}
                          onValueChange={setSearchPatient}
                        />
                        <CommandList>
                          {loadingPatients && (
                            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Mencari...
                            </div>
                          )}

                          {!loadingPatients && patientsData.length === 0 && (
                            <CommandEmpty>Pasien tidak ditemukan.</CommandEmpty>
                          )}

                          {!loadingPatients &&
                            patientsData.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={String(patient.id)}
                                onSelect={() => {
                                  setValue("patient_id", String(patient.id), {
                                    shouldValidate: true,
                                  })
                                  setOpenPatientCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === String(patient.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{patient.nama_lengkap}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {patient.nomor_rekam_medis || patient.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.patient_id && (
                <p className="text-xs text-destructive">{errors.patient_id.message}</p>
              )}
            </div>

            {/* --- DOKTER (SELECT) --- */}
            <div className="space-y-2">
              <Label htmlFor="doctor_id">Dokter</Label>
              <Controller
                name="doctor_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingDoctors}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingDoctors
                            ? "Memuat data..."
                            : (doctorsData.length === 0 ? "Tidak ada dokter" : "Pilih Dokter")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsData.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.nama_lengkap}
                        </SelectItem>
                      ))}
                      {!loadingDoctors && doctorsData.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Tidak ada data dokter
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctor_id && (
                <p className="text-xs text-destructive">{errors.doctor_id.message}</p>
              )}
            </div>
          </div>

          {/* --- INPUT TANGGAL & JAM --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_janji">Tanggal Kunjungan</Label>
              <Controller
                name="tanggal_janji"
                control={control}
                render={({ field }) => (
                  <Input
                    id="tanggal_janji"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...field}
                  />
                )}
              />
              {errors.tanggal_janji && (
                <p className="text-xs text-destructive">{errors.tanggal_janji.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_janji">Jam</Label>
              <Controller
                name="jam_janji"
                control={control}
                render={({ field }) => (
                  <Input
                    id="jam_janji"
                    type="time"
                    {...field}
                  />
                )}
              />
              {errors.jam_janji && (
                <p className="text-xs text-destructive">{errors.jam_janji.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keluhan">Keluhan Utama</Label>
            <Controller
              name="keluhan"
              control={control}
              render={({ field }) => (
                <Input
                  id="keluhan"
                  placeholder="Contoh: Nyeri pada gigi geraham..."
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
          </div>

          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dijadwalkan">Dijadwalkan</SelectItem>
                      <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => handleDialogChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : "Buat Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
