// Simple Header for basic pages
export function SimpleHeader({
    className,
    title,
    subtitle,
}: {
    className?: string;
    title?: string;
    subtitle?: string;
}) {
    return (
        <Header
            variant="minimal"
            size="md"
            showProfile={false}
            className={className}
        >
            <div className="min-w-0 flex-1">
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
        </Header>
    );
}