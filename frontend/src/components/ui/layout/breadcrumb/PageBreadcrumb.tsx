import { Breadcrumb } from "./Breadcrumb";
import { PageBreadcrumbProps } from "./breadcrumb.types";

export function PageBreadcrumb({
    items,
    title,
    description,
    ...props
}: PageBreadcrumbProps) {
    return (
        <div className="space-y-2">
            <Breadcrumb
                items={items}
                size="lg"
                variant="bold"
                {...props}
            />
            {title && (
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && (
                        <p className="text-gray-600">{description}</p>
                    )}
                </div>
            )}
        </div>
    );
}