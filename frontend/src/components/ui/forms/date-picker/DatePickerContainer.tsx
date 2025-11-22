import { DatePickerContainerProps } from "./date-picker.types";
import { cn } from "@/core/utils";

export function DatePickerContainer({
    children,
    className,
}: DatePickerContainerProps) {
    return (
        <div className={cn('grid gap-4', className)}>
            {children}
        </div>
    );
}