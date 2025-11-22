// Minimal Header for authentication pages
export function MinimalHeader({ className }: { className?: string }) {
    return (
        <Header
            variant="minimal"
            size="sm"
            showWelcome={false}
            showProfile={false}
            className={className}
        />
    );
}