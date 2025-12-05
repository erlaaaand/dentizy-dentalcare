"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Shield, UserCog } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
} from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-display/datatable";
import { Badge } from "@/components/ui/data-display/badge";
import SearchInput from "@/components/ui/forms/search-input";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import Avatar from "@/components/ui/data-display/avatar/Avatar";

// Modals
import UserFormModal from "../components/UserFormModal";

import { useModal, useToast, useAuth, ROLES } from "@/core";
import { useGetUsers, useDeleteUser } from "@/core/services/api/user.api";

interface UserListProps {
  roleFilter?: string; // 'all', 'dokter', 'staf'
}

export default function UserList({ roleFilter }: UserListProps) {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Modals
  const formModal = useModal();
  const confirmModal = useModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch API
  const { data: response, isLoading } = useGetUsers({
    page,
    limit,
    // search: searchQuery,
  });

  const deleteMutation = useDeleteUser();

  // Filtering Logic Client Side (Sementara)
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(response)
      ? response
      : (response as any)?.data || [];

    return list.filter((u: any) => {
      const matchSearch =
        u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase());

      let matchRole = true;
      if (roleFilter && roleFilter !== "all") {
        const targetRole =
          roleFilter === "dokter"
            ? ROLES.DOKTER
            : roleFilter === "staf"
            ? ROLES.STAF
            : roleFilter;

        matchRole = u.roles?.some((r: any) => r.name === targetRole);
      }

      return matchSearch && matchRole;
    });
  }, [response, searchQuery, roleFilter]);

  // Handlers
  const handleCreate = () => {
    setSelectedUser(null);
    formModal.open();
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    formModal.open();
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      toast.showSuccess("Pengguna berhasil dihapus");
      confirmModal.close();

      // [FIX 1] Gunakan '/users' agar sesuai dengan key di hook useGetUsers
      queryClient.invalidateQueries({ queryKey: ["/users"] });
    } catch (error: any) {
      toast.showError("Gagal menghapus pengguna");
    }
  };

  // Columns
  const columns = useMemo(
    () => [
      {
        header: "Pengguna",
        accessorKey: "nama_lengkap",
        cell: (info: any) => (
          <div className="flex items-center gap-3">
            <Avatar name={info.getValue()} size="sm" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {info.getValue()}
              </span>
              <span className="text-xs text-gray-500">
                @{info.row.original.username}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Role",
        accessorKey: "roles",
        cell: (info: any) => {
          const roles = info.getValue() || [];
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((r: any) => {
                let color = "default";
                if (r.name === ROLES.KEPALA_KLINIK) color = "primary";
                if (r.name === ROLES.DOKTER) color = "success";
                if (r.name === ROLES.STAF) color = "warning";

                return (
                  <Badge key={r.id} variant={color as any} size="sm">
                    {r.name.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        header: "Status",
        id: "status",
        cell: () => (
          <Badge variant="outline" className="text-xs">
            Aktif
          </Badge>
        ),
      },
      {
        header: "Aksi",
        id: "actions",
        cell: (info: any) => {
          const rowUser = info.row.original;
          const isSelf = rowUser.id === currentUser?.id;

          return (
            <div className="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(rowUser)}
                className="text-gray-500 hover:text-orange-600"
                title="Edit Akses"
              >
                <Edit className="w-4 h-4" />
              </Button>

              {!isSelf && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rowUser)}
                  className="text-gray-500 hover:text-red-600"
                  title="Hapus User"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [currentUser]
  );

  const getTitle = () => {
    if (roleFilter === "dokter") return "Data Dokter";
    if (roleFilter === "staf") return "Data Staf";
    return "Semua Pengguna";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{getTitle()}</CardTitle>
              <CardDescription>
                Menampilkan {filteredUsers.length} pengguna terdaftar.
              </CardDescription>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SearchInput
                  placeholder="Cari Nama / Username..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                <UserCog className="w-4 h-4 mr-2" /> Tambah User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            data={filteredUsers}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Tidak ada pengguna ditemukan."
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(filteredUsers.length / limit) || 1,
              totalItems: filteredUsers.length,
              itemsPerPage: limit,
            }}
          />
        </CardBody>
      </Card>

      <UserFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        initialData={selectedUser}
        onSuccess={() => {
          // [FIX 2] Gunakan '/users' di sini juga agar refresh otomatis jalan
          queryClient.invalidateQueries({ queryKey: ["/users"] });
        }}
      />

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={confirmDelete}
        title="Hapus Pengguna?"
        message={`Anda akan menghapus akun "${selectedUser?.nama_lengkap}". Pengguna ini tidak akan bisa login lagi.`}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
