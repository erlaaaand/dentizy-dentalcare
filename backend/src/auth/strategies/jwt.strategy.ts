import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_SECRET'), // <-- 3. Gunakan ConfigService
        });
    }

    /**
     * Method ini akan dijalankan secara otomatis oleh NestJS
     * SETELAH token berhasil diverifikasi.
     * `payload` adalah isi dari token yang sudah di-decode.
     */
    async validate(payload: { sub: number; username: string }): Promise<User> {
        // Kita cari pengguna di database berdasarkan ID (sub) dari payload token
        const user = await this.usersService.findOne(payload.sub);

        if (!user) {
            // Jika pengguna tidak ditemukan (misalnya sudah dihapus), tolak akses
            throw new UnauthorizedException('Token tidak valid atau pengguna tidak ditemukan.');
        }

        // Data yang kita return di sini akan otomatis ditambahkan oleh Passport
        // ke dalam objek `request` di setiap controller.
        // Inilah yang membuat decorator `@GetUser()` bisa bekerja.
        return user;
    }
}