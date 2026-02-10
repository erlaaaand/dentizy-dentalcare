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
import { Plus, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"

import { AppSidebar } from "@/src/components/dashboard-ui/app-sidebar"
import { SiteHeader } from "@/src/components/dashboard-ui/site-header"
import { SidebarInset, SidebarProvider } from "@/src/components/dashboard-ui/components/sidebar"
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
import { useDebounce } from "@/src/core/hooks/utils/useDebounce"
import { UserApi } from "@/src/core/service/api/users/users.api"

// Components & Types
import { getColumns } from "./_components/columns"
import { UserDialog } from "./_components/user-dialog"
import type {
  UserResponseDto,
  UserPayload,
  StrictCreateUserDto,
  StrictUpdateUserDto,
  ApiPaginatedResponse,
  CreateUserDto,
  UpdateUserDto,
  UsersControllerFindAllParams
} from "./_components/types"

export default function UsersPage() {
  const queryClient = useQueryClient()

  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // 1. Fetch Data
  const { data: response, isLoading, refetch } = useQuery<ApiPaginatedResponse<UserResponseDto>>({
    queryKey: ["users", pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: async () => {
      // Mendefinisikan params dengan aman menggunakan intersection type untuk fleksibilitas search
      const params: UsersControllerFindAllParams & { search?: string } = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }
      
      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      // Gunakan 'as unknown' hanya untuk menjembatani ketidakcocokan minor antara generated type dan params runtime
      // namun kita sudah memvalidasi strukturnya di atas.
      const res = await UserApi.findAll(params)
      return res as unknown as ApiPaginatedResponse<UserResponseDto>
    },
  })

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: StrictCreateUserDto) => 
      // Cast Payload Strict kita ke DTO Backend (CreateUserDto) secara aman
      UserApi.create(data as unknown as CreateUserDto),
    onSuccess: () => {
      toast.success("User berhasil dibuat")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsDialogOpen(false)
    },
    onError: () => toast.error("Gagal membuat user"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StrictUpdateUserDto }) => 
      UserApi.update(id, data as unknown as UpdateUserDto),
    onSuccess: () => {
      toast.success("User berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsDialogOpen(false)
    },
    onError: () => toast.error("Gagal update user"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UserApi.remove(id),
    onSuccess: () => {
      toast.success("User berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => toast.error("Gagal menghapus user"),
  })

  // 3. Handlers
  const handleCreate = useCallback(() => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((data: UserResponseDto) => {
    setSelectedUser(data)
    setIsDialogOpen(true)
  }, [])

  const handleDelete = useCallback((data: UserResponseDto) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Apakah Anda yakin ingin menghapus user ${data.username}?`)) {
      deleteMutation.mutate(data.id)
    }
  }, [deleteMutation])

  const handleFormSubmit = useCallback((payload: UserPayload) => {
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        data: payload as StrictUpdateUserDto,
      })
    } else {
      createMutation.mutate(payload as StrictCreateUserDto)
    }
  }, [selectedUser, updateMutation, createMutation])

  // 4. Table Config
  const columns = useMemo(() => getColumns({ 
    onEdit: handleEdit, 
    onDelete: handleDelete 
  }), [handleEdit, handleDelete])

  const userData = useMemo(() => response?.data || [], [response])
  const pageCount = useMemo(() => response?.meta?.totalPages || response?.totalPages || 1, [response])

  const table = useReactTable({
    data: userData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
  })

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
              <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
              <p className="text-muted-foreground text-sm">
                Kelola akun pengguna dan hak akses aplikasi.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={handleCreate} className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah User
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
                      Tidak ada data user.
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
        </div>
      </SidebarInset>

      <UserDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedUser}
        onSuccess={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
      
      <Toaster />
    </SidebarProvider>
  )
}