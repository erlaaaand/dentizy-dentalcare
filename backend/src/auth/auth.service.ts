import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    // ✅ Dummy hash for timing attack prevention
    private readonly DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    // ✅ FIX: Minimum response time untuk prevent timing attack
    private readonly MIN_RESPONSE_TIME_MS = 200;

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * ✅ CORRECT: Validasi username dan password dengan proper variable declarations
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const startTime = Date.now();

        try {
            // ✅ CORRECT: Fetch user dengan const
            const user = await this.usersService.findOneByUsername(username);
            
            // ✅ CORRECT: Always perform bcrypt.compare untuk prevent timing attack
            const passwordToCheck = user?.password || this.DUMMY_HASH;
            const isPasswordValid = await bcrypt.compare(pass, passwordToCheck);

            // ✅ Ensure minimum response time BEFORE checking credentials
            await this.ensureMinimumResponseTime(startTime);

            // Validate both user existence and password
            if (!user || !isPasswordValid) {
                // SECURITY: Generic error log untuk prevent user enumeration
                this.logger.warn(`Failed login attempt`);
                return null;
            }

            if (!user.password) {
                this.logger.error(`User has no password set`);
                return null;
            }

            // Jangan kembalikan password
            const { password, ...result } = user;
            this.logger.log(`✅ Successful login for user ID: ${result.id}`);
            return result;
            
        } catch (error) {
            // ✅ Ensure timing even on error
            await this.ensureMinimumResponseTime(startTime);
            
            this.logger.error(`Error validating user:`, error.message);
            return null;
        }
    }

    /**
     * ✅ Ensure minimum response time to prevent timing attacks
     */
    private async ensureMinimumResponseTime(startTime: number): Promise<void> {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < this.MIN_RESPONSE_TIME_MS) {
            const delay = this.MIN_RESPONSE_TIME_MS - elapsed;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    /**
     * Login dan generate JWT token
     */
    async login(loginDto: LoginDto) {
        const startTime = Date.now();

        try {
            const user = await this.validateUser(loginDto.username, loginDto.password);
            
            if (!user) {
                // SECURITY: Generic error message
                throw new UnauthorizedException('Username atau password salah');
            }

            const payload = {
                username: user.username,
                sub: user.id,
                roles: user.roles.map((role) => role.name),
            };

            const accessToken = this.jwtService.sign(payload);

            this.logger.log(`✅ Token generated for user ID: ${user.id}`);

            return {
                access_token: accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    nama_lengkap: user.nama_lengkap,
                    roles: user.roles.map((role) => role.name),
                },
            };
        } catch (error) {
            // ✅ Ensure consistent response time even on error
            await this.ensureMinimumResponseTime(startTime);
            throw error;
        }
    }

    /**
     * Register user baru (hanya bisa dilakukan oleh KEPALA_KLINIK)
     */
    async register(registerUserDto: RegisterUserDto) {
        try {
            // CEK: Username sudah ada atau belum
            const existingUser = await this.usersService.findOneByUsername(registerUserDto.username);
            
            if (existingUser) {
                throw new ConflictException(`Username "${registerUserDto.username}" sudah digunakan`);
            }

            // Buat user baru (password akan di-hash di UsersService)
            const newUser = await this.usersService.create(registerUserDto);

            // Jangan kembalikan password
            const { password, ...result } = newUser;
            
            this.logger.log(`✅ New user registered ID: ${newUser.id}`);
            
            return {
                message: 'User berhasil didaftarkan',
                user: result,
            };
            
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            
            this.logger.error('Error registering user:', error);
            throw new Error('Gagal mendaftarkan user');
        }
    }

    /**
     * Verify token (untuk middleware atau frontend)
     */
    async verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
        }
    }

    /**
     * Refresh token (opsional, untuk extend session)
     */
    async refreshToken(userId: number) {
        try {
            const user = await this.usersService.findOne(userId);
            
            if (!user) {
                throw new UnauthorizedException('User tidak ditemukan');
            }

            const payload = {
                username: user.username,
                sub: user.id,
                roles: user.roles.map((role) => role.name),
            };

            return {
                access_token: this.jwtService.sign(payload),
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            
            this.logger.error('Error refreshing token:', error);
            throw new UnauthorizedException('Gagal refresh token');
        }
    }
}