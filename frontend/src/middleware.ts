import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is auth route (login/register)
 */
function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Verify JWT token (simplified - in production use proper JWT verification)
 */
function verifyToken(token: string): { valid: boolean; payload?: any } {
    try {
        // In production, use proper JWT verification library
        // This is a simplified version for demonstration
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return { valid: false };
        }
        
        return { valid: true, payload };
    } catch {
        return { valid: false };
    }
}

/**
 * Extract user roles from token payload
 */
function extractRoles(payload: any): string[] {
    if (!payload) return [];
    
    // Handle different payload structures
    if (Array.isArray(payload.roles)) {
        return payload.roles.map((r: any) => typeof r === 'string' ? r : r.name);
    }
    
    if (typeof payload.role === 'string') {
        return [payload.role];
    }
    
    return [];
}

/**
 * Check if user has access to route based on roles
 */
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

/**
 * Get redirect URL based on user role
 */
function getDefaultRoute(roles: string[]): string {
    if (roles.includes('kepala_klinik')) {
        return '/dashboard';
    }
    if (roles.includes('dokter')) {
        return '/dashboard';
    }
    if (roles.includes('staf')) {
        return '/dashboard/appointments';
    }
    return '/dashboard';
}

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('/static/') ||
        pathname.includes('/images/') ||
        /\.(ico|png|jpg|jpeg|svg|css|js)$/.test(pathname)
    ) {
        return NextResponse.next();
    }
    
    // Get token from cookies
    const token = request.cookies.get('access_token')?.value;
    
    // ============================================
    // HANDLE PUBLIC ROUTES
    // ============================================
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }
    
    // ============================================
    // HANDLE AUTH ROUTES (LOGIN/REGISTER)
    // ============================================
    if (isAuthRoute(pathname)) {
        // If already authenticated, redirect to dashboard
        if (token) {
            const { valid, payload } = verifyToken(token);
            
            if (valid && payload) {
                const roles = extractRoles(payload);
                const redirectUrl = getDefaultRoute(roles);
                return NextResponse.redirect(new URL(redirectUrl, request.url));
            }
        }
        
        // Allow access to auth routes if not authenticated
        return NextResponse.next();
    }
    
    // ============================================
    // HANDLE PROTECTED ROUTES
    // ============================================
    if (isProtectedRoute(pathname)) {
        // No token - redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        
        // Verify token
        const { valid, payload } = verifyToken(token);
        
        // Invalid token - redirect to login
        if (!valid) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('access_token');
            return response;
        }
        
        // Check role-based access
        const roles = extractRoles(payload);
        
        if (!hasRouteAccess(pathname, roles)) {
            // User doesn't have access - redirect to their default route
            const defaultRoute = getDefaultRoute(roles);
            return NextResponse.redirect(new URL(defaultRoute, request.url));
        }
        
        // Add user info to headers (optional - for server components)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.sub || payload.id || '');
        requestHeaders.set('x-user-roles', roles.join(','));
        
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }
    
    // Default: allow request
    return NextResponse.next();
}

// ============================================
// MIDDLEWARE CONFIG
// ============================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};