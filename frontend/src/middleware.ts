import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/core/constants/routes.constants';

// ============================================
// CONFIGURATION
// ============================================

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/dashboard/appointments',
    '/dashboard/patients',
    '/dashboard/medical-records',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/profile'
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/register'];

// Public routes that don't require authentication
// Catatan: Jangan masukkan /login di sini agar logic redirect auth berjalan
const PUBLIC_ROUTES = ['/'];

// Role-based access control
const ROLE_ROUTES: Record<string, string[]> = {
    kepala_klinik: [
        '/dashboard',
        '/dashboard/appointments',
        '/dashboard/patients',
        '/dashboard/medical-records',
        '/dashboard/reports',
        '/dashboard/settings',
        '/dashboard/users'
    ],
    dokter: [
        '/dashboard',
        '/dashboard/appointments',
        '/dashboard/patients',
        '/dashboard/medical-records',
        '/dashboard/reports',
        '/dashboard/profile'
    ],
    staf: [
        '/dashboard',
        '/dashboard/appointments',
        '/dashboard/patients',
        '/dashboard/medical-records',
        '/dashboard/profile'
    ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Verify JWT token (ROBUST VERSION)
 * Menangani format Base64Url dan Padding dengan benar agar tidak error di atob()
 */
function verifyToken(token: string): { valid: boolean; payload?: unknown } {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false };
        }

        // 1. Handle Base64Url characters
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // 2. Add Padding if needed
        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

        // 3. Decode & Parse
        const jsonPayload = atob(paddedBase64);
        const payload = JSON.parse(jsonPayload);

        // 4. Check Expiration
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return { valid: false };
        }

        return { valid: true, payload };
    } catch (error) {
        console.error(error)
        return { valid: false };
    }
}

function extractRoles(payload: unknown): string[] {
    if (!payload || typeof payload !== "object") return [];

    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj["roles"])) {
        return (obj["roles"] as unknown[]).map((r) =>
            typeof r === "string"
                ? r
                : typeof r === "object" && r !== null && "name" in r
                ? String((r as Record<string, unknown>)["name"])
                : ""
        ).filter(Boolean);
    }

    if (typeof obj["role"] === "string") {
        return [obj["role"]];
    }

    return [];
}

function hasRouteAccess(pathname: string, roles: string[]): boolean {
    // Kepala klinik has access to everything
    if (roles.includes('kepala_klinik')) {
        return true;
    }

    // Check each role
    for (const role of roles) {
        const allowedRoutes = ROLE_ROUTES[role] || [];
        if (allowedRoutes.some(route => pathname.startsWith(route))) {
            return true;
        }
    }

    return false;
}

function getDefaultRoute(roles: string[]): string {
    if (roles.includes('kepala_klinik')) return '/dashboard';
    if (roles.includes('dokter')) return '/dashboard';
    if (roles.includes('staf')) return '/dashboard/appointments';
    return '/dashboard';
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
        /\.(ico|png|jpg|jpeg|svg|css|js)$/.test(pathname)
    ) {
        return NextResponse.next();
    }

    // 2. Get token from cookies (Name must match useAuth.ts)
    const token = request.cookies.get('access_token')?.value;

    // 3. Handle Public Routes (e.g. Landing Page)
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // 4. HANDLE AUTH ROUTES (Login/Register)
    if (isAuthRoute(pathname)) {
        if (token) {
            // If user is already logged in, redirect to their default dashboard
            const { valid, payload } = verifyToken(token);

            if (valid && payload) {
                const roles = extractRoles(payload);
                const redirectUrl = getDefaultRoute(roles);
                return NextResponse.redirect(new URL(redirectUrl, request.url));
            }
        }
        // If not logged in, allow access to Login page
        return NextResponse.next();
    }

    // 5. HANDLE PROTECTED ROUTES (Dashboard, etc.)
    if (isProtectedRoute(pathname)) {
        // A. No Token -> Redirect to Login
        if (!token) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // B. Invalid/Expired Token -> Redirect to Login & Clear Cookie
        const { valid, payload } = verifyToken(token);
        if (!valid) {
            const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
            response.cookies.delete("access_token");
            return response;
        }

        // C. Check Role Access
        const roles = extractRoles(payload);
        if (!hasRouteAccess(pathname, roles)) {
            const defaultRoute = getDefaultRoute(roles);
            return NextResponse.redirect(new URL(defaultRoute, request.url));
        }

        // D. Allow Access (Inject user info to headers)
        const requestHeaders = new Headers(request.headers);

        if (payload && typeof payload === "object") {
            const obj = payload as Record<string, unknown>;

            const userId =
                typeof obj["sub"] === "string"
                    ? obj["sub"]
                    : typeof obj["id"] === "string"
                    ? obj["id"]
                    : "";

            requestHeaders.set("x-user-id", userId);
        } else {
            requestHeaders.set("x-user-id", "");
        }

        requestHeaders.set("x-user-roles", roles.join(","));

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Default: Allow other requests
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};