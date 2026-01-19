import { Separator } from "@/src/components/ui/separator"
import { SidebarTrigger } from "@/src/components/ui/sidebar"
import { IconBell } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"

export function SiteHeader() {
  const notificationCount = 2

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium">Documents</h1>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <IconBell className="h-6 w-6" />

                {/* Badge */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 p-0" // ⬅️ lebar standar industri
            >
              {/* Header */}
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  You have {notificationCount} new notifications
                </p>
              </div>

              {/* Items */}
              <DropdownMenuItem className="flex flex-col items-start gap-1 px-4 py-3">
                <p className="text-sm font-medium">
                  New document uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                  “Project Proposal.pdf” was added
                </p>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex flex-col items-start gap-1 px-4 py-3">
                <p className="text-sm font-medium">
                  Approval required
                </p>
                <p className="text-xs text-muted-foreground">
                  Waiting for your confirmation
                </p>
              </DropdownMenuItem>

              {/* Footer */}
              <div className="border-t px-4 py-2 text-center">
                <button className="text-xs font-medium text-primary hover:underline">
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
