import { DateRangePickerProps } from "./date-picker.types";
import { cn } from "@/core/utils";
import { DatePicker } from "./DatePicker";

export function DateRangePicker({
    startDate,
    endDate,
    onChange,
    label,
    error,
    hint,
    min,
    max,
    disabled,
    required,
    className,
}: DateRangePickerProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {label && (
                <label className={cn(
                    'block font-medium text-gray-700 text-sm',
                    disabled && 'text-gray-400'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="grid grid-cols-2 gap-3">
                <DatePicker
                    value={startDate}
                    onChange={(date) => onChange?.(date, endDate || '')}
                    placeholder="Dari tanggal"
                    min={min}
                    max={endDate || max}
                    disabled={disabled}
                    size="sm"
                />

                <DatePicker
                    value={endDate}
                    onChange={(date) => onChange?.(startDate || '', date)}
                    placeholder="Sampai tanggal"
                    min={startDate || min}
                    max={max}
                    disabled={disabled}
                    size="sm"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {hint && !error && (
                <p className="text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
}