"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table"
import { RefreshCw, Search, ShieldAlert, FileText, Users, ListFilter } from "lucide-react"

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

// Hooks & Services
import { useAuth } from "@/src/core/providers/AuthProvider"
import { useDebounce } from "@/src/core/hooks/utils/useDebounce"
import { MedicalRecordApi } from "@/src/core/service/api/medical-records/medical-record.api"

// Components & Types
import { getColumns } from "./_components/columns"
import { RecordDetailDialog } from "./_components/record-detail-dialog"
import type {
  MedicalRecordResponseDto,
  ApiPaginatedResponse,
  MedicalRecordsControllerFindAllParams
} from "./_components/types"

export default function MedicalRecordsPage() {
  const { user, isLoading: authLoading } = useAuth()

  // State
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordResponseDto | null>(null)
  const [currentTab, setCurrentTab] = useState("my-records") // 'my-records' | 'all-records'
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Role Checks
  const userRoles = useMemo(() => user?.roles?.map((r) => r.name) || [], [user])
  const isHeadClinic = userRoles.includes("kepala_klinik")
  const isDoctor = userRoles.includes("dokter")
  const isStaff = userRoles.includes("staf") // Staff biasanya tidak boleh lihat RM detail medis

  // Access Guard
  const hasAccess = isDoctor || isHeadClinic

  // 1. Fetch Data
  const { data: response, isLoading, refetch } = useQuery<ApiPaginatedResponse<MedicalRecordResponseDto>>({
    queryKey: ["medical-records", currentTab, pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: async () => {
      // Setup Params
      const params: MedicalRecordsControllerFindAllParams & { search?: string } = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }

      // Filter Search
      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      // Filter Scope (My Records vs All)
      if (currentTab === "my-records" && user?.id) {
        params.doctor_id = Number(user.id)
      } else if (!isHeadClinic && isDoctor && user?.id) {
        // Jika dokter biasa akses tab lain (preventif), paksa filter ke ID sendiri
        params.doctor_id = Number(user.id)
      }

      // Casting aman ke tipe internal
      const res = await MedicalRecordApi.findAll(params)
      return res as unknown as ApiPaginatedResponse<MedicalRecordResponseDto>
    },
    enabled: !!user && hasAccess, // Hanya fetch jika user ada dan punya akses
  })

  // Handlers
  const handleViewDetail = useCallback((data: MedicalRecordResponseDto) => {
    setSelectedRecord(data)
    setIsDetailOpen(true)
  }, [])

  // Table Config
  const showDoctorColumn = currentTab === "all-records" || isHeadClinic

  const columns = useMemo(() => getColumns({ 
    onView: handleViewDetail, 
    showDoctorColumn
  }), [handleViewDetail, showDoctorColumn])

  const recordData = useMemo(() => response?.data || [], [response])
  const pageCount = useMemo(() => response?.meta?.totalPages || response?.totalPages || 1, [response])

  const table = useReactTable({
    data: recordData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Loading State Auth
  if (authLoading) return <div className="p-8 text-center text-muted-foreground">Memuat akses...</div>

  // Access Denied UI
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldAlert className="size-16 text-destructive" />
        <h3 className="text-xl font-bold">Akses Ditolak</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Data rekam medis bersifat rahasia. <br/>
          Hanya Dokter dan Kepala Klinik yang memiliki izin akses.
        </p>
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
              <h2 className="text-2xl font-bold tracking-tight">Rekam Medis Pasien</h2>
              <p className="text-muted-foreground text-sm">
                Arsip riwayat pemeriksaan, diagnosa, dan tindakan medis.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="my-records" className="gap-2">
                  <FileText className="size-4" /> Pasien Saya
                </TabsTrigger>
                {isHeadClinic && (
                  <TabsTrigger value="all-records" className="gap-2">
                    <Users className="size-4" /> Semua Rekam Medis
                  </TabsTrigger>
                )}
              </TabsList>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari Pasien, RM, Diagnosa..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <ListFilter className="size-4" />
                </Button>
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
                          Tidak ada data rekam medis.
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

      <RecordDetailDialog 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        data={selectedRecord}
      />
      
    </SidebarProvider>
  )
}