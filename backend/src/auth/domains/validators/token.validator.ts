// domains/validators/token.validator.ts
import { UnauthorizedException } from '@nestjs/common';

export class TokenValidator {
    /**
     * Validate token format
     */
    static validateTokenFormat(token: string): void {
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new UnauthorizedException('Invalid token format');
        }

        // Basic validation of each part
        for (const part of parts) {
            if (!part || part.length === 0) {
                throw new UnauthorizedException('Invalid token structure');
            }
        }
    }

    /**
     * Extract token from Authorization header
     */
    static extractBearerToken(authHeader: string): string {
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is required');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer') {
            throw new UnauthorizedException('Invalid authorization type');
        }

        if (!token) {
            throw new UnauthorizedException('Token not provided');
        }

        return token;
    }
}