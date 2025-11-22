import { StatsCardProps } from "./card.types";
import { default as Card } from "./Card";
import { cn } from "@/core/utils";

export function StatsCard({
    title,
    value,
    description,
    trend,
    icon,
    ...cardProps
}: StatsCardProps) {
    return (
        <Card {...cardProps}>
            <Card.Body padding="lg">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                        {trend && (
                            <div className={cn(
                                'flex items-center mt-2 text-sm font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                <span>
                                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                                </span>
                                <span className="ml-1">from last period</span>
                            </div>
                        )}
                    </div>
                    {icon && (
                        <div className="flex-shrink-0 ml-4">
                            {icon}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}