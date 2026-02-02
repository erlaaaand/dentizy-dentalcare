"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Shield, Mail, Edit, Trash2 } from "lucide-react"

import { Button } from "@/src/components/dashboard-ui/components/button"
import { Badge } from "@/src/components/dashboard-ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/dashboard-ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/dashboard-ui/components/dropdown-menu"
import { type UserResponseDto } from "./types"

interface ColumnProps {
  onEdit: (data: UserResponseDto) => void
  onDelete: (data: UserResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnProps): ColumnDef<UserResponseDto>[] => [
  {
    accessorKey: "nama_lengkap",
    header: "User",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.profile_photo?.url} alt={user.nama_lengkap} />
            <AvatarFallback>{user.nama_lengkap.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.nama_lengkap}</span>
            <span className="text-xs text-muted-foreground">@{user.username}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="size-3" />
        <span>{row.getValue("email") || "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles || []
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary" className="text-[10px] flex items-center gap-1 px-2">
              <Shield className="size-3" />
              {role.name.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Salin ID User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 size-3" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-3" /> Hapus User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]