// frontend/src/app/(dashboard)/dashboard/components/shared/DashboardHeader.tsx
"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  action,
}: DashboardHeaderProps) {
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
          <CalendarIcon className="w-4 h-4" />
          <span>{today}</span>
          {subtitle && (
            <>
              <span className="text-gray-300">•</span>
              <span>{subtitle}</span>
            </>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
