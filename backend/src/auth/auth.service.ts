import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username); // Anda perlu membuat method ini di UsersService
        if (user && user.password && await bcrypt.compare(pass, user.password)) {
            // Jangan kembalikan password
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        const payload = {
            username: user.username,
            sub: user.id, // 'sub' adalah standar untuk subject (ID unik)
            roles: user.roles.map((role) => role.name), // Ambil nama perannya
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}