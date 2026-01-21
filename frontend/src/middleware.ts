import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, PROTECTED_ROUTES } from './core/constants/routes.constants';

// ============================================
// CONFIGURATION
// ============================================

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

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

        // Handle Base64Url encoding
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding
        const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

        // Decode and parse
        const jsonPayload = atob(paddedBase64);
        const payload = JSON.parse(jsonPayload) as Record<string, unknown>;

        // Check expiration
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
    // Handle array of role objects
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

    // Handle single role string
    if (typeof payload.role === 'string') {
        return [payload.role];
    }

    return [];
}

function normalizeRoleName(role: string): string {
    const normalized = role.toLowerCase().replace(/\s+/g, '_');
    
    // Map common variations
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
    // Normalize role names
    const normalizedRoles = roles.map(normalizeRoleName);

    // Kepala klinik has access to everything
    if (normalizedRoles.includes('kepala_klinik')) {
        return true;
    }

    // Check each normalized role
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

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('/static/') ||
        pathname.includes('/images/') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
    ) {
        return NextResponse.next();
    }

    // 2. Get token from cookies - CRITICAL FIX
    const token = request.cookies.get('access_token')?.value;

    // 3. Handle Public Routes (Landing page, etc)
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // 4. Handle Auth Routes (Login page)
    if (isAuthRoute(pathname)) {
        // If user has valid token, redirect to dashboard
        if (token) {
            const { valid, payload } = verifyToken(token);

            if (valid && payload) {
                const roles = extractRoles(payload);
                const redirectUrl = getDefaultRoute(roles);
                return NextResponse.redirect(new URL(redirectUrl, request.url));
            }
        }
        // No token or invalid token, allow access to login page
        return NextResponse.next();
    }

    // 5. Handle Protected Routes
    if (isProtectedRoute(pathname)) {
        // A. No token -> Redirect to login
        if (!token) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // B. Verify token
        const { valid, payload } = verifyToken(token);

        // Invalid/expired token -> Clear cookie and redirect to login
        if (!valid || !payload) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('access_token');
            return response;
        }

        // C. Check role-based access
        const roles = extractRoles(payload);
        
        if (!hasRouteAccess(pathname, roles)) {
            const defaultRoute = getDefaultRoute(roles);
            return NextResponse.redirect(new URL(defaultRoute, request.url));
        }

        // D. Allow access - Add user info to headers
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

    // Default: Allow
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};