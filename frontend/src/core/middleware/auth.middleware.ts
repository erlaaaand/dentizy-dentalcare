// frontend/src/core/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { ROUTES, PUBLIC_ROUTES } from '@/core/constants/routes.constants';

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication token
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}