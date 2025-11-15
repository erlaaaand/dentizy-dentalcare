import { Breadcrumb } from "./Breadcrumb";
import { BreadcrumbProps } from "./breadcrumb.types";

// Compact Breadcrumb for tight spaces
export function CompactBreadcrumb(props: BreadcrumbProps) {
    return (
        <Breadcrumb
            size="sm"
            variant="minimal"
            {...props}
        />
    );
}