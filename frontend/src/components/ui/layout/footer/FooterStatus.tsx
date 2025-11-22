import { FooterProps } from "./footer.types";
import { sizeClasses, statusText } from "./footer.styles";
import { cn } from "@/core";
import { StatusIndicator, SyncIcon } from "./Icon.styles";

export function FooterStatus({
    status = 'online',
    lastSync,
    size = 'md',
}: {
    status?: FooterProps['status'];
    lastSync?: string;
    size?: FooterProps['size'];
}) {
    const sizeClass = sizeClasses[size];

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <StatusIndicator status={status} size={size} />
                <span className={cn('text-gray-500', sizeClass.text)}>
                    {statusText[status]}
                </span>
            </div>

            {lastSync && (
                <div className="flex items-center space-x-2">
                    <SyncIcon className={cn('text-gray-500', sizeClass.icon)} />
                    <span className={cn('text-gray-500', sizeClass.text)}>
                        {lastSync}
                    </span>
                </div>
            )}
        </div>
    );
}