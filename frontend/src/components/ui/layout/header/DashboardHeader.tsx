// ========================================
// frontend/src/components/ui/layout/header/DashboardHeader.tsx
// ========================================
import { Header } from './Header';

export function DashboardHeader({
    className,
    userName,
    userRole,
}: {
    className?: string;
    userName?: string;
    userRole?: string;
}) {
    return (
        <Header
            variant="dashboard"
            size="lg"
            userName={userName}
            userRole={userRole}
            className={className}
        />
    );
}