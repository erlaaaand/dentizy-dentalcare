"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

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

import { patientFormSchema, type PatientFormValues } from "./schema"
import { 
  type PatientResponseDto, 
  type PatientPayload, 
  type StrictCreatePatientDto, 
  type StrictUpdatePatientDto,
  PatientResponseDtoJenisKelamin
} from "./types"

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PatientResponseDto | null
  onSuccess: (data: PatientPayload) => void
  isSubmitting?: boolean
}

export function PatientDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  isSubmitting = false,
}: PatientDialogProps) {
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nama_lengkap: "",
      nik: "",
      no_hp: "",
      email: "",
      alamat: "",
      jenis_kelamin: PatientResponseDtoJenisKelamin.L,
      tanggal_lahir: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          nama_lengkap: initialData.nama_lengkap,
          nik: initialData.nik || "",
          no_hp: initialData.no_hp || "",
          email: initialData.email || "",
          alamat: initialData.alamat || "",
          jenis_kelamin: initialData.jenis_kelamin,
          tanggal_lahir: initialData.tanggal_lahir ? new Date(initialData.tanggal_lahir).toISOString().split("T")[0] : "",
        })
      } else {
        reset({
          nama_lengkap: "",
          nik: "",
          no_hp: "",
          email: "",
          alamat: "",
          jenis_kelamin: PatientResponseDtoJenisKelamin.L,
          tanggal_lahir: "",
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = (values: PatientFormValues) => {
    if (initialData) {
      const updatePayload: StrictUpdatePatientDto = {
        ...values,
        nik: values.nik || undefined,
        no_hp: values.no_hp || undefined,
        email: values.email || undefined,
      }
      onSuccess(updatePayload)
    } else {
      const createPayload: StrictCreatePatientDto = {
        ...values,
        nik: values.nik || undefined,
        no_hp: values.no_hp || undefined,
        email: values.email || undefined,
      }
      onSuccess(createPayload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pasien" : "Tambah Pasien Baru"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Perbarui data identitas pasien." : "Daftarkan pasien baru ke dalam sistem."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nama_lengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input 
                id="nama_lengkap" 
                placeholder="Sesuai KTP" 
                {...register("nama_lengkap")} 
              />
              {errors.nama_lengkap && <p className="text-xs text-destructive">{errors.nama_lengkap.message}</p>}
            </div>

            {/* NIK */}
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input 
                id="nik" 
                placeholder="16 Digit" 
                {...register("nik")} 
                maxLength={16}
              />
              {errors.nik && <p className="text-xs text-destructive">{errors.nik.message}</p>}
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
              <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="jenis_kelamin"
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PatientResponseDtoJenisKelamin.L}>Laki-laki</SelectItem>
                      <SelectItem value={PatientResponseDtoJenisKelamin.P}>Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.jenis_kelamin && <p className="text-xs text-destructive">{errors.jenis_kelamin.message}</p>}
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-2">
              <Label htmlFor="tanggal_lahir">Tanggal Lahir <span className="text-red-500">*</span></Label>
              <Input 
                id="tanggal_lahir" 
                type="date" 
                {...register("tanggal_lahir")} 
              />
              {errors.tanggal_lahir && <p className="text-xs text-destructive">{errors.tanggal_lahir.message}</p>}
            </div>

            {/* No HP */}
            <div className="space-y-2">
              <Label htmlFor="no_hp">No. HP / WhatsApp</Label>
              <Input 
                id="no_hp" 
                placeholder="08..." 
                {...register("no_hp")} 
              />
              {errors.no_hp && <p className="text-xs text-destructive">{errors.no_hp.message}</p>}
            </div>

            {/* Email */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@contoh.com" 
                {...register("email")} 
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="alamat">Alamat Lengkap</Label>
              <Input 
                id="alamat" 
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." 
                {...register("alamat")} 
              />
              {errors.alamat && <p className="text-xs text-destructive">{errors.alamat.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : "Simpan Pasien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}