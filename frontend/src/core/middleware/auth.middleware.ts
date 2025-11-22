import { NextRequest, NextResponse } from 'next/server';
import { ROUTES, PUBLIC_ROUTES } from '../constants/routes.constants';
import { storageService } from '../services/cache/storage.service';

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check authentication
  const token = storageService.getAccessToken();
  
  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}