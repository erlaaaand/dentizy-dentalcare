// Minimal Footer for authentication pages
import { Footer } from "./Footer";

export function MinimalFooter({ className }: { className?: string }) {
    return (
        <Footer
            variant="minimal"
            size="sm"
            showStatus={false}
            className={className}
            copyrightText="© 2025 Dentizy Dentalcare"
        />
    );
}