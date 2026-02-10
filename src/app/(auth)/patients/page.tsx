"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table"
import { Plus, RefreshCw, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/src/components/dashboard-ui/app-sidebar"
import { SiteHeader } from "@/src/components/dashboard-ui/site-header"
import { SidebarInset, SidebarProvider } from "@/src/components/dashboard-ui/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/dashboard-ui/components/tabs"
import { Button } from "@/src/components/dashboard-ui/components/button"
import { Input } from "@/src/components/dashboard-ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/dashboard-ui/components/table"
import { Toaster } from "@/src/components/dashboard-ui/components/sonner"

// Hooks & Services
import { useAuth } from "@/src/core/providers/AuthProvider"
import { useDebounce } from "@/src/core/hooks/utils/useDebounce"
import { PatientService } from "@/src/core/service/api/patients/patient.api"

// Generated Types (Import langsung DTO asli untuk casting)
import type { 
  CreatePatientDto, 
  UpdatePatientDto,
  PatientsControllerFindAllParams 
} from "@/src/core/api/model"

// Components & Local Types
import { getColumns } from "./_components/columns"
import { PatientDialog } from "./_components/patient-dialog"
import type {
  PatientResponseDto,
  PatientPayload,
  StrictCreatePatientDto,
  StrictUpdatePatientDto,
  ApiPaginatedResponse,
} from "./_components/types"

export default function PatientsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientResponseDto | null>(null)
  const [currentTab, setCurrentTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Role Logic
  const userRoles = useMemo(() => user?.roles?.map((r) => r.name) || [], [user])
  const isHeadClinic = userRoles.includes("kepala_klinik")
  const isStaff = userRoles.includes("staf")
  const isDoctor = userRoles.includes("dokter")
  
  const canManage = isHeadClinic || isStaff

  // 1. Fetch Data (Query)
  const { data: response, isLoading, refetch } = useQuery<ApiPaginatedResponse<PatientResponseDto>>({
    queryKey: ["patients", currentTab, pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: async () => {
      // Konstruksi parameter dengan tipe yang valid
      // Kita gunakan intersection type (&) untuk mengakomodasi parameter 'search' atau 'doctor_id' 
      // yang mungkin belum ada di definisi standar 'PatientsControllerFindAllParams'
      const params: PatientsControllerFindAllParams & { search?: string; doctor_id?: string } = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }

      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      if (currentTab === "my" && user?.id) {
        params.doctor_id = user.id
      }

      // Casting hasil ke ApiPaginatedResponse untuk konsistensi di frontend
      const res = await PatientService.getAll(params)
      return res as unknown as ApiPaginatedResponse<PatientResponseDto>
    },
    enabled: !!user,
  })

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: StrictCreatePatientDto) => {
      // SOLUSI ERROR: Casting payload kita (Strict) ke DTO Asli (CreatePatientDto)
      // 'unknown' digunakan sebagai jembatan aman karena struktur Strict kita sudah pasti valid
      return PatientService.create(data as unknown as CreatePatientDto)
    },
    onSuccess: () => {
      toast.success("Pasien berhasil ditambahkan")
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      setIsDialogOpen(false)
    },
    onError: () => toast.error("Gagal menambah pasien"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StrictUpdatePatientDto }) => {
      // SOLUSI ERROR: Casting ke UpdatePatientDto
      return PatientService.update(id, data as unknown as UpdatePatientDto)
    },
    onSuccess: () => {
      toast.success("Data pasien diperbarui")
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      setIsDialogOpen(false)
    },
    onError: () => toast.error("Gagal update pasien"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PatientService.delete(id),
    onSuccess: () => {
      toast.success("Data pasien dihapus")
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
    onError: () => toast.error("Gagal menghapus pasien"),
  })

  // 3. Handlers
  const handleCreate = useCallback(() => {
    setSelectedPatient(null)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((data: PatientResponseDto) => {
    setSelectedPatient(data)
    setIsDialogOpen(true)
  }, [])

  const handleDelete = useCallback((data: PatientResponseDto) => {
    if (confirm(`Hapus data pasien ${data.nama_lengkap}?`)) {
      deleteMutation.mutate(data.id)
    }
  }, [deleteMutation])

  const handleFormSubmit = useCallback((payload: PatientPayload) => {
    if (selectedPatient) {
      updateMutation.mutate({
        id: selectedPatient.id,
        data: payload as StrictUpdatePatientDto,
      })
    } else {
      createMutation.mutate(payload as StrictCreatePatientDto)
    }
  }, [selectedPatient, updateMutation, createMutation])

  // 4. Table Config
  const columns = useMemo(() => getColumns({ 
    onEdit: handleEdit, 
    onDelete: handleDelete,
    canManage
  }), [canManage, handleEdit, handleDelete])

  const patientData = useMemo(() => response?.data || [], [response])
  const pageCount = useMemo(() => response?.meta?.totalPages || response?.totalPages || 1, [response])

  const table = useReactTable({
    data: patientData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (authLoading) return <div className="p-8 text-center text-muted-foreground">Memuat akses...</div>

  // Guard Clause
  if (!isHeadClinic && !isStaff && !isDoctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldAlert className="size-16 text-destructive" />
        <h3 className="text-xl font-bold">Akses Ditolak</h3>
        <p className="text-muted-foreground">Anda tidak memiliki izin mengakses halaman ini.</p>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Data Pasien</h2>
              <p className="text-muted-foreground text-sm">
                Kelola data induk dan riwayat pasien klinik.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              {canManage && (
                <Button onClick={handleCreate} className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Pasien Baru
                </Button>
              )}
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                {canManage && <TabsTrigger value="all">Semua Pasien</TabsTrigger>}
                {(isDoctor || isHeadClinic) && <TabsTrigger value="my">Pasien Saya</TabsTrigger>}
              </TabsList>
              
              <div className="w-full sm:w-64">
                <Input 
                  placeholder="Cari Nama, NIK, atau RM..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value={currentTab} className="space-y-4">
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          Tidak ada data pasien.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="flex items-center justify-end space-x-2 border-t px-4 py-4">
                  <span className="text-muted-foreground mr-4 text-sm">
                    Halaman {pagination.pageIndex + 1} dari {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      <PatientDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedPatient}
        onSuccess={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
      
      <Toaster />
    </SidebarProvider>
  )
}