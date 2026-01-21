import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, PROTECTED_ROUTES } from './core/constants/routes.constants';

const AUTH_ROUTES = [ROUTES.LOGIN];
const PUBLIC_ROUTES = [ROUTES.HOME];

const ROLE_ROUTES: Record<string, string[]> = {
    kepala_klinik: [
        ROUTES.DASHBOARD,
        ROUTES.APPOINTMENTS,
        ROUTES.PATIENTS,
        ROUTES.MEDICAL_RECORDS,
        ROUTES.REPORTS,
        ROUTES.SETTINGS,
        ROUTES.USERS,
        ROUTES.PAYMENTS,
        ROUTES.TREATMENTS,
        ROUTES.PROFILE
    ],
    dokter: [
        ROUTES.DASHBOARD,
        ROUTES.APPOINTMENTS,
        ROUTES.PATIENTS,
        ROUTES.MEDICAL_RECORDS,
        ROUTES.PROFILE
    ],
    staf: [
        ROUTES.DASHBOARD,
        ROUTES.APPOINTMENTS,
        ROUTES.PATIENTS,
        ROUTES.PAYMENTS,
        ROUTES.TREATMENTS,
        ROUTES.PROFILE
    ]
};

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => pathname === route);
}

function verifyToken(token: string): { valid: boolean; payload?: Record<string, unknown> } {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false };
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

        const jsonPayload = atob(paddedBase64);
        const payload = JSON.parse(jsonPayload) as Record<string, unknown>;

        if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
            return { valid: false };
        }

        return { valid: true, payload };
    } catch (error) {
        console.error('Token verification error:', error);
        return { valid: false };
    }
}

function extractRoles(payload: Record<string, unknown>): string[] {
    if (Array.isArray(payload.roles)) {
        return payload.roles
            .map((r) => {
                if (typeof r === 'string') return r;
                if (typeof r === 'object' && r !== null && 'name' in r) {
                    return String((r as Record<string, unknown>).name);
                }
                return '';
            })
            .filter(Boolean);
    }

    if (typeof payload.role === 'string') {
        return [payload.role];
    }

    return [];
}

function normalizeRoleName(role: string): string {
    const normalized = role.toLowerCase().replace(/\s+/g, '_');
    
    if (normalized.includes('kepala') || normalized.includes('klinik') || normalized.includes('clinic')) {
        return 'kepala_klinik';
    }
    if (normalized.includes('dokter') || normalized.includes('doctor')) {
        return 'dokter';
    }
    if (normalized.includes('staf') || normalized.includes('staff')) {
        return 'staf';
    }
    
    return normalized;
}

function hasRouteAccess(pathname: string, roles: string[]): boolean {
    const normalizedRoles = roles.map(normalizeRoleName);

    if (normalizedRoles.includes('kepala_klinik')) {
        return true;
    }

    for (const role of normalizedRoles) {
        const allowedRoutes = ROLE_ROUTES[role] || [];
        if (allowedRoutes.some(route => pathname.startsWith(route))) {
            return true;
        }
    }

    return false;
}

function getDefaultRoute(roles: string[]): string {
    const normalizedRoles = roles.map(normalizeRoleName);
    
    if (normalizedRoles.includes('kepala_klinik')) return ROUTES.DASHBOARD;
    if (normalizedRoles.includes('dokter')) return ROUTES.DASHBOARD;
    if (normalizedRoles.includes('staf')) return ROUTES.APPOINTMENTS;
    
    return ROUTES.DASHBOARD;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('/static/') ||
        pathname.includes('/images/') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('access_token')?.value;

    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    if (isAuthRoute(pathname)) {
        if (token) {
            const { valid, payload } = verifyToken(token);

            if (valid && payload) {
                const roles = extractRoles(payload);
                const redirectUrl = getDefaultRoute(roles);
                return NextResponse.redirect(new URL(redirectUrl, request.url));
            }
        }
        return NextResponse.next();
    }

    if (isProtectedRoute(pathname)) {
        if (!token) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const { valid, payload } = verifyToken(token);

        if (!valid || !payload) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('access_token');
            return response;
        }

        const roles = extractRoles(payload);
        
        if (!hasRouteAccess(pathname, roles)) {
            const defaultRoute = getDefaultRoute(roles);
            return NextResponse.redirect(new URL(defaultRoute, request.url));
        }

        const requestHeaders = new Headers(request.headers);
        const userId = typeof payload.sub === 'string' ? payload.sub : 
                      typeof payload.id === 'string' ? payload.id : '';
        
        requestHeaders.set('x-user-id', userId);
        requestHeaders.set('x-user-roles', roles.join(','));

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};