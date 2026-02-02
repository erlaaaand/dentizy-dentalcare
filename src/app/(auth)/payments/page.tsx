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
import { RefreshCw, Wallet, History, ShieldAlert, Search } from "lucide-react"

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
import { useAuth } from "@/src/core/providers/auth-provider"
import { useDebounce } from "@/src/core/hooks/utils/useDebounce"
import { PaymentApi } from "@/src/core/service/api/payments/payments.api"

// Components & Types
import { getColumns } from "./_components/columns"
import { PaymentDialog } from "./_components/payment-dialog"
import { 
  type PaymentResponseDto, 
  type ApiPaginatedResponse,
  PaymentsControllerFindAllStatusPembayaran,
  type PaymentsControllerFindAllParams
} from "./_components/types"

export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  
  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDto | null>(null)
  const [currentTab, setCurrentTab] = useState<"pending" | "history">("pending")
  const [isReadOnlyDialog, setIsReadOnlyDialog] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Role Checks (RBAC)
  const userRoles = useMemo(() => user?.roles?.map((r) => r.name) || [], [user])
  const canAccess = userRoles.includes("staf") || userRoles.includes("kepala_klinik")

  // 1. Fetch Data
  const { data: response, isLoading, refetch } = useQuery<ApiPaginatedResponse<PaymentResponseDto>>({
    queryKey: ["payments", currentTab, pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: async () => {
      // Mapping params sesuai Tab
      const statusParam = currentTab === "pending" 
        ? PaymentsControllerFindAllStatusPembayaran.pending 
        : PaymentsControllerFindAllStatusPembayaran.lunas

      const params: PaymentsControllerFindAllParams & { search?: string } = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        statusPembayaran: statusParam,
      }

      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      // Casting aman ke tipe internal
      const res = await PaymentApi.findAll(params)
      return res as unknown as ApiPaginatedResponse<PaymentResponseDto>
    },
    enabled: !!user && canAccess,
  })

  // Handlers
  const handleProcess = useCallback((data: PaymentResponseDto) => {
    setSelectedPayment(data)
    setIsReadOnlyDialog(false) // Mode Bayar
    setIsDialogOpen(true)
  }, [])

  const handleView = useCallback((data: PaymentResponseDto) => {
    setSelectedPayment(data)
    setIsReadOnlyDialog(true) // Mode View Detail
    setIsDialogOpen(true)
  }, [])

  // Table Config
  const columns = useMemo(() => getColumns({ 
    onProcess: handleProcess, 
    onView: handleView 
  }), [handleProcess, handleView])

  const paymentData = useMemo(() => response?.data || [], [response])
  const pageCount = useMemo(() => response?.meta?.totalPages || response?.totalPages || 1, [response])

  const table = useReactTable({
    data: paymentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (authLoading) return <div className="p-8 text-center text-muted-foreground">Memuat akses...</div>

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldAlert className="size-16 text-destructive" />
        <h3 className="text-xl font-bold">Akses Ditolak</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Halaman Kasir hanya dapat diakses oleh Staf Administrasi dan Kepala Klinik.
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
              <h2 className="text-2xl font-bold tracking-tight">Kasir & Pembayaran</h2>
              <p className="text-muted-foreground text-sm">
                Pusat pengelolaan transaksi dan tagihan pasien.
              </p>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "pending" | "history")} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <Wallet className="size-4" /> Menunggu Pembayaran
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="size-4" /> Riwayat Transaksi
                </TabsTrigger>
              </TabsList>

              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari Invoice / Pasien..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
                          {currentTab === "pending" 
                            ? "Tidak ada tagihan menunggu pembayaran." 
                            : "Belum ada riwayat transaksi."}
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

      <PaymentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        data={selectedPayment}
        readOnly={isReadOnlyDialog}
      />
      
    </SidebarProvider>
  )
}