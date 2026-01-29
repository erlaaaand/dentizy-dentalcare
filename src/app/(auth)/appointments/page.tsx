"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table"
import { Plus, ListFilter, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/src/components/dashboard-ui/app-sidebar"
import { SiteHeader } from "@/src/components/dashboard-ui/site-header"
import { SidebarInset, SidebarProvider } from "@/src/components/dashboard-ui/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/dashboard-ui/components/tabs"
import { Button } from "@/src/components/dashboard-ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/dashboard-ui/components/table"
import { Toaster } from "@/src/components/dashboard-ui/components/sonner"

import { getColumns } from "./_components/columns"
import { AppointmentDialog } from "./_components/appointment-dialog"
import {
  AppointmentResponseDto,
  AppointmentPayload,
  StrictCreateAppointmentDto,
  StrictUpdateAppointmentDto,
  AppointmentsControllerFindAllParams,
  PaginatedAppointmentResponseDto,
  AppointmentsControllerFindAllStatus,
} from "./_components/types"

import { AppointmentApi } from "@/src/core/service/api/appointments/appointment.api"

export default function AppointmentsPage() {
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDto | null>(null)
  const [currentTab, setCurrentTab] = useState("all")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Menggunakan useMemo untuk parameter query agar referensi stabil
  const queryParams: AppointmentsControllerFindAllParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      // ✅ Gunakan Enum khusus Controller Params, BUKAN Dto Status
      status: currentTab === "requests" 
        ? AppointmentsControllerFindAllStatus.menunggu_konfirmasi 
        : undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, currentTab]
  )

  // Fetch Data dengan Type Safety
  const { data: response, isLoading, refetch } = useQuery<PaginatedAppointmentResponseDto>({
    queryKey: ["appointments", queryParams],
    queryFn: async () => {
      const res = await AppointmentApi.findAll(queryParams)
      // Asserting type karena AppointmentApi.findAll mungkin return generic
      return res as unknown as PaginatedAppointmentResponseDto
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: StrictCreateAppointmentDto) =>
      AppointmentApi.create(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Jadwal berhasil dibuat")
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      setIsDialogOpen(false)
    },
    onError: () => {
      toast.error("Gagal membuat jadwal")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StrictUpdateAppointmentDto }) =>
      AppointmentApi.update(id, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Jadwal berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      setIsDialogOpen(false)
    },
    onError: () => {
      toast.error("Gagal memperbarui jadwal")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => AppointmentApi.cancel(id),
    onSuccess: () => {
      toast.success("Jadwal berhasil dibatalkan")
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
    onError: () => {
      toast.error("Gagal membatalkan jadwal")
    },
  })

  const handleCreate = useCallback(() => {
    setSelectedAppointment(null)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((data: AppointmentResponseDto) => {
    setSelectedAppointment(data)
    setIsDialogOpen(true)
  }, [])

  const handleCancel = useCallback(
    (data: AppointmentResponseDto) => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Apakah Anda yakin ingin membatalkan jadwal pasien ${data.patient?.nama_lengkap}?`)) {
        cancelMutation.mutate(data.id)
      }
    },
    [cancelMutation]
  )

  const handleFormSubmit = useCallback(
    (payload: AppointmentPayload) => {
      if (selectedAppointment) {
        updateMutation.mutate({
          id: selectedAppointment.id,
          data: payload as StrictUpdateAppointmentDto,
        })
      } else {
        createMutation.mutate(payload as StrictCreateAppointmentDto)
      }
    },
    [selectedAppointment, updateMutation, createMutation]
  )

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onCancel: handleCancel }),
    [handleEdit, handleCancel]
  )

  const appointmentData = useMemo(() => response?.data || [], [response])
  const pageCount = useMemo(() => response?.totalPages || 1, [response])

  const table = useReactTable({
    data: appointmentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manajemen Jadwal</h2>
              <p className="text-muted-foreground text-sm">
                Kelola pendaftaran pasien, jadwal dokter, dan verifikasi kunjungan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={handleCreate} className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Buat Janji Baru
              </Button>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">Semua Jadwal</TabsTrigger>
                <TabsTrigger value="requests">Permintaan Masuk</TabsTrigger>
              </TabsList>

              <Button variant="outline" size="sm" className="hidden md:flex">
                <ListFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                          Tidak ada data jadwal.
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

            <TabsContent value="requests">
              <div className="rounded-md border bg-card p-4">
                <p className="text-muted-foreground mb-4 text-sm">
                  Daftar di bawah ini adalah jadwal dengan status <strong>Menunggu Konfirmasi</strong>.
                </p>
                {/* Re-use Table Logic untuk tab requests (data sudah difilter via queryParams) */}
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
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
                          Tidak ada permintaan baru.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedAppointment}
        onSuccess={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <Toaster />
    </SidebarProvider>
  )
}