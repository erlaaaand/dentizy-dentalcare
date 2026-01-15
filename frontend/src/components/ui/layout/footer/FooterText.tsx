import { cn } from "@/core";

export function FooterText({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={cn('text-sm text-gray-500', className)}>
            {children}
        </p>
    );
}