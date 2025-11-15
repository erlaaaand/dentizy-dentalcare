// domains/services/token.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from '../../applications/dto/token-payload.dto';

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);

    constructor(private readonly jwtService: JwtService) { }

    /**
     * Generate JWT token from user payload
     */
    generateToken(payload: TokenPayloadDto): string {
        try {
            const token = this.jwtService.sign({
                username: payload.username,
                sub: payload.userId,
                roles: payload.roles,
            });

            this.logger.debug(`Token generated for user ID: ${payload.userId}`);
            return token;
        } catch (error) {
            this.logger.error('Failed to generate token', error);
            throw new Error('Token generation failed');
        }
    }

    /**
     * Verify and decode JWT token
     */
    verifyToken(token: string): TokenPayloadDto {
        try {
            const decoded = this.jwtService.verify(token);

            return {
                userId: decoded.sub,
                username: decoded.username,
                roles: decoded.roles || [],
            };
        } catch (error) {
            this.logger.warn('Token verification failed');
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean {
        try {
            this.jwtService.verify(token);
            return false;
        } catch (error) {
            return true;
        }
    }
}