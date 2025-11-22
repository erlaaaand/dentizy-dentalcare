import { SkeletonTableProps } from "./skeleton.types";
import Skeleton from "./Skeleton";
import { cn } from "@/core/utils";


export function SkeletonTable({
    rows = 5,
    cols = 4,
    compact = false,
    hasHeader = true,
    hasCheckboxes = false,
}: SkeletonTableProps) {
    const paddingClass = compact ? 'px-3 py-2' : 'px-6 py-4';
    const textClass = compact ? 'text-xs' : 'text-sm';

    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                {hasHeader && (
                    <thead className="bg-gray-50">
                        <tr>
                            {hasCheckboxes && (
                                <th className={cn(paddingClass, 'w-12')}>
                                    <Skeleton variant="rounded" width={16} height={16} />
                                </th>
                            )}
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className={paddingClass}>
                                    <Skeleton
                                        variant="text"
                                        width={i === 0 ? '80%' : '60%'}
                                        className={textClass}
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {hasCheckboxes && (
                                <td className={paddingClass}>
                                    <Skeleton variant="rounded" width={16} height={16} />
                                </td>
                            )}
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <td key={colIndex} className={paddingClass}>
                                    <Skeleton
                                        variant="text"
                                        width={colIndex === 0 ? '90%' : '70%'}
                                        className={textClass}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}