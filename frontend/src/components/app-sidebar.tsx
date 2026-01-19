"use client"

import * as React from "react"
import {
  IconChartBar,
  IconLayoutDashboard,
  IconStethoscope,
  IconFileText,
  IconHelp,
  IconInnerShadowTop,
  IconCalendar,
  IconCreditCard,
  IconSearch,
  IconSettings,
  IconUsers,
  IconHeartbeat
} from "@tabler/icons-react"

import { NavMain } from "@/src/components/nav-main"
import { NavSecondary } from "@/src/components/nav-secondary"
import { NavUser } from "@/src/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar"

import { ROUTES } from "@/src/core/constants/routes.constants";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: ROUTES.DASHBOARD,
      icon: IconLayoutDashboard,
    },
    {
      title: "Appointments",
      url: ROUTES.APPOINTMENTS,
      icon: IconCalendar,
    },
    {
      title: "Patients",
      url: ROUTES.PATIENTS,
      icon: IconStethoscope,
    },
    {
      title: "Medical Records",
      url: ROUTES.MEDICAL_RECORDS,
      icon: IconFileText,
    },
    {
      title: "User Management",
      url: ROUTES.USERS,
      icon: IconUsers,
    },
    {
      title: "Reports and Analytics",
      url: ROUTES.REPORTS,
      icon: IconChartBar,
    },
    {
      title: "Payments",
      url: ROUTES.PAYMENTS,
      icon: IconCreditCard,
    },
    {
      title: "Treatments",
      url: ROUTES.TREATMENTS,
      icon: IconHeartbeat,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dentizy Dentalcare</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
