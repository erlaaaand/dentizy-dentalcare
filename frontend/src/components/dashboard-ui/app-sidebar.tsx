"use client"

import * as React from "react"
import {
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "@/src/components/dashboard-ui/nav-main"
import { NavUser } from "@/src/components/dashboard-ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/dashboard-ui/components/sidebar"

import { PROTECTED_ROUTES } from "@/src/core/constants/routes.constants"
import { useUser } from "@/src/core/hooks/auth/useAuth" // Pastikan path hook useAuth sesuai
import { UserResponseDto } from "@/src/core/api/model" // Import Type DTO

import { getRoleKey, NAV_ITEMS } from "@/src/core/constants/navigation.constants"; // Sesuaikan path


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 3. Integrasi Hook Backend
  const { data: apiResponse, isLoading } = useUser();

  // 4. Casting Data & Filtering Logic
  const userData = React.useMemo(() => {
    return apiResponse?.data as UserResponseDto | undefined;
  }, [apiResponse]);

  const userRole = React.useMemo(() => {
    if (!userData?.roles) return null;
    return getRoleKey(userData.roles[0].name);
  }, [userData]);

  // Filter Navigasi Utama berdasarkan Role
  const filteredNavMain = React.useMemo(() => {
    if (!userRole) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  // Siapkan objek user untuk komponen NavUser
  const userForNav = React.useMemo(() => ({
    name: userData?.nama_lengkap || "User",
    email: userData?.email || "user@dentizy.com",
    avatar: typeof userData?.profile_photo === "string"
      ? userData.profile_photo
      : "/avatars/default.jpg",
  }), [userData]);


  if (isLoading) {
    return <Sidebar collapsible="offcanvas" {...props}><div className="p-4 text-sm">Memuat menu...</div></Sidebar>
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={PROTECTED_ROUTES[0]} className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dentizy Dentalcare</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Menggunakan data yang sudah difilter (filteredNavMain) */}
        <NavMain items={filteredNavMain} />
        {/* <NavSecondary items={NAV_ITEMS} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* Menggunakan data user asli dari backend */}
        <NavUser user={userForNav} />
      </SidebarFooter>
    </Sidebar>
  )
}