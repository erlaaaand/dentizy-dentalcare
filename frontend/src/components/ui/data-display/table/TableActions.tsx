import { cn } from "@/core/utils";
import { TableActionsProps } from "./table.types";

export function TableActions({ children, className }: TableActionsProps) {
  return (
    <div className={cn('flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-200', className)}>
      {children}
    </div>
  );
}
