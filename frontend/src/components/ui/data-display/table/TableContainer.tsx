import { cn } from "@/lib/utils";
import { TableContainerProps } from "./table.types";


export function TableContainer({ children, className, title, description, actions }: TableContainerProps) {
    return (
        <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
            {/* Header */}
            {(title || description || actions) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex-1">
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}

            {/* Table Content */}
            {children}
        </div>
    );
}