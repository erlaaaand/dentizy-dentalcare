import { cn } from "@/lib/utils";
import { CheckboxGroupProps } from "./checkbox.types";

export function CheckboxGroup({
    children,
    label,
    description,
    error,
    className,
    required = false,
    orientation = 'vertical',
}: CheckboxGroupProps) {
    return (
        <div className={cn('w-full', className)}>
            {/* Group Label */}
            {(label || description) && (
                <div className="mb-3">
                    {label && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    )}
                    {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                    )}
                </div>
            )}

            {/* Checkboxes */}
            <div className={cn(
                'space-y-2',
                orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
            )}>
                {children}
            </div>

            {/* Group Error */}
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}