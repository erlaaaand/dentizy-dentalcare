export class AuthTokenManager {

  setTokenInCookie(token: string): void {
    if (typeof document === 'undefined') return;
    
    const isSecure = window.location.protocol === 'https:';
    const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = cookieString;
  }

  getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    
    if (!tokenCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    return token ? decodeURIComponent(token.trim()) : null;
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  clearAuthData(): void {
    if (typeof document !== 'undefined') {
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
    }
  }

  decodeToken(token: string): { exp: number; sub: string } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const now = Date.now() / 1000;
    return decoded.exp < now;
  }

  getTokenTimeToExpire(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded) return 0;
    
    const now = Date.now() / 1000;
    return Math.max(0, decoded.exp - now);
  }

  shouldRefreshToken(token: string): boolean {
    const timeToExpire = this.getTokenTimeToExpire(token);
    return timeToExpire > 0 && timeToExpire < 5 * 60;
  }
}

export const authTokenManager = new AuthTokenManager();