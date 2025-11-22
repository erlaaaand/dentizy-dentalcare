// ========================================
// frontend/src/components/ui/layout/header/MinimalHeader.tsx
// ========================================
import { Header } from './Header';

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