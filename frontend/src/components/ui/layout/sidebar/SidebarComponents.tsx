import Link from 'next/link';
import { cn } from '@/core';
import { Badge } from '../../data-display/badge';
import { NavigationItem, BadgeVariant } from './sidebar.types';
import { colorToVariantMap } from './sidebar.config';

interface NavItemProps {
    item: NavigationItem;
    isActive: boolean;
    isMinimized: boolean;
    index: number;
}

export function NavItem({ item, isActive, isMinimized, index }: NavItemProps) {
    return (
        <li className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <Link
                href={item.href}
                className={cn(
                    'flex items-center p-3 rounded-lg transition-all hover-lift relative group',
                    isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-700',
                    isMinimized ? 'justify-center' : 'space-x-3'
                )}
            >
                <span className={isActive ? 'animate-pulse' : ''}>{item.icon}</span>
                {!isMinimized && (
                    <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                            <Badge variant={colorToVariantMap[item.badge.color]} className="flex-shrink-0">
                                {item.badge.text}
                            </Badge>
                        )}
                    </>
                )}
                {isMinimized && <NavTooltip label={item.label} />}
            </Link>
        </li>
    );
}

function NavTooltip({ label }: { label: string }) {
    return (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 animate-scale-in">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
        </div>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; variant: BadgeVariant }> = {
        kepala_klinik: { label: 'Kepala Klinik', variant: 'default' },
        dokter: { label: 'Dokter', variant: 'info' },
        staf: { label: 'Staf', variant: 'success' },
    };
    const config = roleConfig[role] || { label: role, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SidebarSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded-lg animate-pulse" />
            ))}
        </div>
    );
}

export function EmptyNavigation() {
    return (
        <div className="text-center text-gray-400 text-sm py-8">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>Tidak ada menu tersedia</p>
        </div>
    );
}

interface SidebarHeaderProps {
    isMinimized: boolean;
    onToggle: () => void;
}

export function SidebarHeader({ isMinimized, onToggle }: SidebarHeaderProps) {
    const Logo = () => (
        <svg className="w-8 h-8 text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
    );

    if (isMinimized) {
        return (
            <header className="border-b border-gray-700 p-4 flex-shrink-0">
                <button onClick={onToggle} className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-700 transition-colors group" title="Expand sidebar">
                    <Logo />
                </button>
            </header>
        );
    }

    return (
        <header className="border-b border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between animate-fade-in">
                <div className="flex items-center space-x-3 min-w-0">
                    <Logo />
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold truncate">Dentizy</h1>
                        <p className="text-sm text-gray-300 truncate">Dentalcare</p>
                    </div>
                </div>
                <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0" title="Minimize sidebar">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </header>
    );
}