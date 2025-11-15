import { Footer } from "./Footer";

// Compact Footer for modals/drawers
export function CompactFooter({ className }: { className?: string }) {
    return (
        <Footer
            variant="minimal"
            size="sm"
            showStatus={false}
            showVersion={false}
            className={className}
            copyrightText="© 2025 Dentizy Dentalcare"
        />
    );
}