import { AlertContainerProps } from "./alert-banner.types";
import React from "react";
import { cn } from "@/core";

export function AlertContainer({
    children,
    position = 'top-right',
    maxAlerts = 5,
    className,
}: AlertContainerProps) {
    const positionClasses = {
        'top-left': 'top-4 left-4 items-start',
        'top-right': 'top-4 right-4 items-end',
        'bottom-left': 'bottom-4 left-4 items-start',
        'bottom-right': 'bottom-4 right-4 items-end',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2 items-center',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 items-center',
    };

    return (
        <div
            className={cn(
                'fixed z-50 flex flex-col gap-3 max-w-md',
                positionClasses[position],
                className
            )}
            style={{ maxHeight: `calc(100vh - 2rem)` }}
        >
            {React.Children.toArray(children).slice(0, maxAlerts)}
        </div>
    );
}