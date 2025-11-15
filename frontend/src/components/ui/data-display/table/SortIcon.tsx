import { SortIconProps } from "./table.types";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";


export function SortIcon({ sortConfig, columnKey }: SortIconProps) {
    if (!sortConfig || sortConfig.key !== columnKey) {
        return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }

    return sortConfig.direction === 'asc' ? (
        <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
        <ChevronDown className="w-4 h-4 text-blue-600" />
    );
}