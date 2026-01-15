"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, UserCog } from "lucide-react";

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

import UserFormModal from "../components/UserFormModal";

import { useModal, useToast, useAuth, ROLES } from "@/core";
import { useGetUsers, useDeleteUser } from "@/core/services/api/user.api";

interface UserListProps {
  roleFilter?: string;
}

interface Role {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  nama_lengkap: string;
  username: string;
  email?: string | null;
  roles?: Role[];
}

function isRoleArray(data: unknown): data is Role[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof (item as Record<string, unknown>).id === 'number' &&
    'name' in item &&
    typeof (item as Record<string, unknown>).name === 'string'
  );
}

function convertToUserData(user: Record<string, unknown>): UserData | undefined {
  const id = user.id;
  const namaLengkap = user.nama_lengkap;
  const username = user.username;
  const email = typeof user.email === 'string' ? user.email : null;

  if (
    typeof id === 'number' &&
    typeof namaLengkap === 'string' &&
    typeof username === 'string'
  ) {
    const roles = isRoleArray(user.roles) ? user.roles : undefined;
    return {
      id,
      nama_lengkap: namaLengkap,
      username,
      email,
      roles
    };
  }
  
  return undefined;
}

function extractUsersFromResponse(response: unknown): Record<string, unknown>[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response as Record<string, unknown>[];
  }

  const responseObj = response as Record<string, unknown>;
  
  if (Array.isArray(responseObj.data)) {
    return responseObj.data as Record<string, unknown>[];
  }
  
  if (Array.isArray(responseObj.users)) {
    return responseObj.users as Record<string, unknown>[];
  }
  
  if (Array.isArray(responseObj.items)) {
    return responseObj.items as Record<string, unknown>[];
  }

  return [];
}

export default function UserList({ roleFilter }: UserListProps) {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const formModal = useModal();
  const confirmModal = useModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading } = useGetUsers({
    page,
    limit,
  });

  const deleteMutation = useDeleteUser();

  const filteredUsers = useMemo(() => {
    const users = extractUsersFromResponse(response);
    
    return users.filter((user) => {
      const namaLengkap = typeof user.nama_lengkap === 'string' ? user.nama_lengkap : "";
      const username = typeof user.username === 'string' ? user.username : "";
      
      const matchSearch =
        namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        username.toLowerCase().includes(searchQuery.toLowerCase());

      let matchRole = true;
      if (roleFilter && roleFilter !== "all") {
        const targetRole = roleFilter === "dokter" ? ROLES.DOKTER :
                          roleFilter === "staf" ? ROLES.STAF : roleFilter;

        const roles = user.roles;
        if (isRoleArray(roles)) {
          matchRole = roles.some((r: Role) => r.name === targetRole);
        } else {
          matchRole = false;
        }
      }

      return matchSearch && matchRole;
    });
  }, [response, searchQuery, roleFilter]);

  const handleCreate = () => {
    setSelectedUser(undefined);
    formModal.open();
  };

  const handleEdit = (user: Record<string, unknown>) => {
    setSelectedUser(user);
    formModal.open();
  };

  const handleDelete = (user: Record<string, unknown>) => {
    setSelectedUser(user);
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!selectedUser || typeof selectedUser.id !== 'number') return;
    try {
      await deleteMutation.mutateAsync({ id: selectedUser.id });
      toast.showSuccess("Pengguna berhasil dihapus");
      confirmModal.close();
      queryClient.invalidateQueries({ queryKey: ["/users"] });
    } catch (error) {
      console.error(error);
      toast.showError("Gagal menghapus pengguna");
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Pengguna",
        accessorKey: "nama_lengkap",
        cell: (info: { getValue: () => unknown; row: { original: Record<string, unknown> } }) => {
          const value = info.getValue();
          const original = info.row.original;
          const namaLengkap = typeof value === 'string' ? value : "";
          const username = typeof original.username === 'string' ? original.username : "";
          
          return (
            <div className="flex items-center gap-3">
              <Avatar name={namaLengkap} size="sm" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {namaLengkap}
                </span>
                <span className="text-xs text-gray-500">
                  @{username}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Role",
        accessorKey: "roles",
        cell: (info: { getValue: () => unknown; row: { original: Record<string, unknown> } }) => {
          const roles = info.getValue();
          
          if (isRoleArray(roles)) {
            return (
              <div className="flex flex-wrap gap-1">
                {roles.map((r) => {
                  let color = "default";
                  if (r.name === ROLES.KEPALA_KLINIK) color = "primary";
                  if (r.name === ROLES.DOKTER) color = "success";
                  if (r.name === ROLES.STAF) color = "warning";

                  return (
                    <Badge key={r.id} variant={color as "default" | "primary" | "success" | "warning"} size="sm">
                      {r.name.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  );
                })}
              </div>
            );
          }
          
          return null;
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
        cell: (info: { getValue: () => unknown; row: { original: Record<string, unknown> } }) => {
          const rowUser = info.row.original;
          const rowUserId = typeof rowUser.id === 'number' ? rowUser.id : undefined;
          const currentUserRecord = currentUser as Record<string, unknown>;
          const currentUserId = typeof currentUserRecord?.id === 'number' ? currentUserRecord.id : undefined;
          const isSelf = rowUserId !== undefined && currentUserId !== undefined && rowUserId === currentUserId;

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

  const getSelectedUserName = (): string => {
    if (!selectedUser) return "";
    const namaLengkap = selectedUser.nama_lengkap;
    return typeof namaLengkap === 'string' ? namaLengkap : "";
  };

  const getUserDataForModal = (): UserData | undefined => {
    if (!selectedUser) return undefined;
    return convertToUserData(selectedUser);
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
        initialData={getUserDataForModal()}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/users"] });
        }}
      />

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={confirmDelete}
        title="Hapus Pengguna?"
        message={`Anda akan menghapus akun "${getSelectedUserName()}". Pengguna ini tidak akan bisa login lagi.`}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}