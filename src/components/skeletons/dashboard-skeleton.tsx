import { Skeleton } from "@/src/components/dashboard-ui/components/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* 1. Sidebar Skeleton (Hidden di Mobile, Visible di Desktop) */}
      <div className="hidden w-72 border-r bg-sidebar md:block">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-6 w-32" /> {/* Brand/Logo */}
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* 2. Main Content Skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header Skeleton */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Trigger Button */}
          <div className="flex flex-1 items-center justify-between">
            <Skeleton className="h-5 w-40" /> {/* Breadcrumb */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* User Avatar */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Section Cards (3 Grid) */}
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>

          {/* Chart Area */}
          <Skeleton className="h-[300px] w-full rounded-xl" />

          {/* Table Area */}
          <div className="space-y-2">
             <Skeleton className="h-10 w-full rounded-md" />
             <Skeleton className="h-10 w-full rounded-md" />
             <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}