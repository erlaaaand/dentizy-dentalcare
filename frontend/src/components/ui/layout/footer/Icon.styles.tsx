import { FooterProps } from "./footer.types";
import { sizeClasses, statusClasses } from "./footer.styles";
import { cn } from "@/core/utils";

export const SyncIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        />
    </svg>
);

export const StatusIndicator = ({ status, size = 'md' }: { status: FooterProps['status']; size?: FooterProps['size'] }) => {
    const sizeClass = sizeClasses[size];

    return (
        <div
            className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                statusClasses[status || 'online']
            )}
        />
    );
};
