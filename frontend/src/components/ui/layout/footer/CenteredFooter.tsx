import { Footer } from "./Footer";

// Centered Footer for landing pages
export function CenteredFooter({
    className,
    showStatus = false,
}: {
    className?: string;
    showStatus?: boolean;
}) {
    return (
        <Footer
            variant="centered"
            size="md"
            showStatus={showStatus}
            className={className}
        />
    );
}