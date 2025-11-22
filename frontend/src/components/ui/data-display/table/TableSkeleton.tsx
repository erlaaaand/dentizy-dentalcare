import { cn } from "@/core/utils";
import { TableSkeletonProps } from "./table.types";
import { sizeClasses } from "./table.styles";

function TableSkeleton({ columns, rows, compact = false }: TableSkeletonProps) {
    const sizeClass = compact ? sizeClasses.compact : sizeClasses.normal;

    return (
        <>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                    {[...Array(columns)].map((_, colIndex) => (
                        <td
                            key={colIndex}
                            className={cn(
                                sizeClass.cell,
                                'whitespace-nowrap'
                            )}
                        >
                            <div
                                className={cn(
                                    'h-4 bg-gray-200 rounded',
                                    colIndex % 3 === 0 ? 'w-3/4' : 'w-full'
                                )}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

