import { cn } from "@/core";
import { FileUploadContainerProps } from "./file-upload.types";


export function FileUploadContainer({
    children,
    className,
}: FileUploadContainerProps) {
    return (
        <div className={cn('grid gap-4', className)}>
            {children}
        </div>
    );
}