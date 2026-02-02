"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
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

// Import API Roles
import { RolesApi } from "@/src/core/service/api/roles/roles.api"

import { userFormSchema, type UserFormValues } from "./schema"
import { 
  type UserResponseDto, 
  type UserPayload, 
  type StrictCreateUserDto, 
  type StrictUpdateUserDto,
  type UserRoleDto
} from "./types"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: UserResponseDto | null
  onSuccess: (data: UserPayload) => void
  isSubmitting?: boolean
}

export function UserDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  isSubmitting = false,
}: UserDialogProps) {
  
  // 1. Fetch Roles untuk Dropdown
  const { data: availableRoles, isLoading: loadingRoles } = useQuery<UserRoleDto[]>({
    queryKey: ["roles-list"],
    queryFn: async () => {
      // Menggunakan API wrapper yang sudah kita perbaiki tipenya
      return await RolesApi.findAll()
    },
    enabled: open, // Fetch hanya saat dialog terbuka
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nama_lengkap: "",
      username: "",
      email: "",
      password: "",
      roles: [],
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mode Edit: Map roles object ke array of IDs
        const roleIds = initialData.roles?.map((r) => r.id) || []
        reset({
          nama_lengkap: initialData.nama_lengkap,
          username: initialData.username,
          email: initialData.email || "",
          password: "",
          roles: roleIds,
        })
      } else {
        // Mode Create
        reset({
          nama_lengkap: "",
          username: "",
          email: "",
          password: "",
          roles: [],
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = (values: UserFormValues) => {
    if (initialData) {
      const updatePayload: StrictUpdateUserDto = {
        nama_lengkap: values.nama_lengkap,
        username: values.username,
        email: values.email || undefined,
        roles: values.roles,
      }
      if (values.password) {
        updatePayload.password = values.password
      }
      onSuccess(updatePayload)
    } else {
      const createPayload: StrictCreateUserDto = {
        nama_lengkap: values.nama_lengkap,
        username: values.username,
        email: values.email || undefined,
        password: values.password,
        roles: values.roles,
      }
      onSuccess(createPayload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit User" : "Tambah User Baru"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Perbarui informasi akun pengguna." : "Buat akun baru dan tetapkan role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          
          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
              <Input 
                id="nama_lengkap" 
                placeholder="Contoh: Drg. Budi Santoso" 
                {...register("nama_lengkap")} 
              />
              {errors.nama_lengkap && <p className="text-xs text-destructive">{errors.nama_lengkap.message}</p>}
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="budi_s" 
                  {...register("username")} 
                />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="budi@klinik.com" 
                  {...register("email")} 
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {initialData && <span className="text-xs text-muted-foreground font-normal">(Isi jika ingin mengubah)</span>}
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="******" 
                {...register("password")} 
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Role Selection (Dropdown) */}
            <div className="space-y-2">
              <Label>Role Access</Label>
              <Controller
                control={control}
                name="roles"
                render={({ field }) => (
                  <Select 
                    // Ambil nilai pertama dari array roles, atau string kosong jika belum ada
                    value={field.value?.[0] || ""} 
                    onValueChange={(val) => {
                      // Karena backend minta array string[], kita bungkus valuenya
                      // Ini mengasumsikan 1 user = 1 role utama untuk UI Dropdown ini
                      field.onChange([val]) 
                    }}
                    disabled={loadingRoles}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRoles ? "Memuat role..." : "Pilih Role Pengguna"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <span className="capitalize">
                            {role.name.replace(/_/g, " ")}
                          </span>
                        </SelectItem>
                      ))}
                      
                      {!loadingRoles && availableRoles?.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Tidak ada data role
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roles && <p className="text-xs text-destructive">{errors.roles.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : "Buat User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}