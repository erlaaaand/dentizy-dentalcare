import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './core/constants/routes.constants';

const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/login'];

function verifyToken(token: string): { valid: boolean; payload?: Record<string, unknown> } {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return { valid: false };

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

        const jsonPayload = atob(paddedBase64);
        const payload = JSON.parse(jsonPayload) as Record<string, unknown>;

        if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
            return { valid: false };
        }

        return { valid: true, payload };
    } catch {
        return { valid: false };
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip assets
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

    // Public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // Auth routes (login)
    if (AUTH_ROUTES.includes(pathname)) {
        if (token) {
            const { valid } = verifyToken(token);
            if (valid) {
                return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
            }
        }
        return NextResponse.next();
    }

    // Protected routes
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

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};