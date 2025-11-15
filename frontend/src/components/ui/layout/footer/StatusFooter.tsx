import { FooterProps } from "./footer.types";
import { Footer } from "./Footer";

// Status Footer for dashboard/app views
export function StatusFooter({
    status = 'online',
    lastSync,
    className,
}: {
    status?: FooterProps['status'];
    lastSync?: string;
    className?: string;
}) {
    return (
        <Footer
            showVersion={false}
            status={status}
            lastSync={lastSync}
            className={className}
            copyrightText="© 2025 Dentizy Dentalcare"
        />
    );
}