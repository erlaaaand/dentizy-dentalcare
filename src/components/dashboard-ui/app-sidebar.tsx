"use client"

import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"
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
import { ROUTES } from "@/src/core/constants/routes.constants"
import { useAuth } from "@/src/core/providers/AuthProvider"
import { getRoleKey, NAV_ITEMS } from "@/src/core/constants/navigation.constants"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();

  // Get user role
  const userRole = React.useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return null;
    return getRoleKey(user.roles[0].name);
  }, [user]);

  // Filter navigation based on role
  const filteredNavMain = React.useMemo(() => {
    if (!userRole) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  // Prepare user data for NavUser
  const userForNav = React.useMemo(() => ({
    name: user?.nama_lengkap || "User",
    email: user?.email || "user@dentizy.com",
    avatar: typeof user?.profile_photo === "string"
      ? user.profile_photo
      : "/avatars/default.jpg",
  }), [user]);

  // Loading state
  if (isLoading) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <div className="p-4 text-sm text-muted-foreground">Memuat menu...</div>
      </Sidebar>
    );
  }

  // No user (shouldn't happen in protected route, but safe guard)
  if (!user) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <div className="p-4 text-sm text-muted-foreground">Tidak ada data user</div>
      </Sidebar>
    );
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
              <a href={ROUTES.DASHBOARD} className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dentizy Dentalcare</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter> 
        <NavUser user={userForNav} />
      </SidebarFooter>
    </Sidebar>
  )
}