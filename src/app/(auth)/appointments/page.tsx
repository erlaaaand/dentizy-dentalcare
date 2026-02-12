"use client"

import { useState, useMemo, useCallback } from "react"
import {
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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

// Core hooks and providers
import { useAppointments } from "@/src/core/hooks/appointments/useAppointments"
import { useAppointmentContext } from "@/src/core/providers"

import { getColumns } from "./_components/columns"
import { AppointmentDialog, type AppointmentPayload } from "./_components/appointment-dialog"
import {
  type AppointmentResponseDto,
  type CreateAppointmentDto,
  type UpdateAppointmentDto,
  type AppointmentsControllerFindAllParams,
} from "@/src/core/types/appointments/appointment.types"

export default function AppointmentsPage() {
  const { selectedAppointment, setSelectedAppointment, mutations } = useAppointmentContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("all")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const queryParams: AppointmentsControllerFindAllParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: currentTab === "requests"
        ? "menunggu_konfirmasi"
        : undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, currentTab]
  )

  const { data: response, isLoading, refetch } = useAppointments(queryParams)

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
      // Menggunakan window.confirm secara eksplisit untuk menghindari restricted-globals eslint error
      if (typeof window !== "undefined" && window.confirm(`Apakah Anda yakin ingin membatalkan jadwal pasien ${data.patient?.nama_lengkap}?`)) {
        mutations.cancelAsync(data.id)
          .then(() => {
            toast.success("Jadwal berhasil dibatalkan")
          })
          .catch(() => {
            toast.error("Gagal membatalkan jadwal")
          })
      }
    },
    [mutations]
  )

  const handleFormSubmit = useCallback(
    (payload: AppointmentPayload) => {
      if (selectedAppointment) {
        mutations.updateAsync({ id: selectedAppointment.id, data: payload as UpdateAppointmentDto })
          .then(() => {
            toast.success("Jadwal berhasil diperbarui")
            setIsDialogOpen(false)
          })
          .catch(() => {
            toast.error("Gagal memperbarui jadwal")
          })
      } else {
        mutations.createAsync(payload as CreateAppointmentDto)
          .then(() => {
            toast.success("Jadwal berhasil dibuat")
            setIsDialogOpen(false)
          })
          .catch(() => {
            toast.error("Gagal membuat jadwal")
          })
      }
    },
    [selectedAppointment, mutations]
  )

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onCancel: handleCancel }),
    [handleEdit, handleCancel]
  )

  const appointmentData = useMemo(() => response?.data ?? [], [response])
  const pageCount = useMemo(() => response?.totalPages ?? 1, [response])

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

  const renderLoading = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        Memuat data...
      </TableCell>
    </TableRow>
  )

  const renderEmpty = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        Tidak ada data jadwal.
      </TableCell>
    </TableRow>
  )

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
                    {isLoading
                      ? renderLoading()
                      : table.getRowModel().rows?.length
                        ? table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                        : renderEmpty()}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
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
        isSubmitting={mutations.isCreating || mutations.isUpdating}
      />

      <Toaster />
    </SidebarProvider>
  )
}
