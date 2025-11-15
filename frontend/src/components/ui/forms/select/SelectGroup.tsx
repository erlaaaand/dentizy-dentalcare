export function SelectGroup({
    children,
    className,
    direction = 'horizontal',
}: SelectGroupProps) {
    return (
        <div
            className={cn(
                'flex gap-4',
                direction === 'vertical' && 'flex-col',
                direction === 'horizontal' && 'items-end',
                className
            )}
        >
            {children}
        </div>
    );
}