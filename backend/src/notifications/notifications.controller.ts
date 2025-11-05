import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ✅ FIX: Tambah guards
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    /**
     * ✅ FIX: Hanya STAF dan KEPALA_KLINIK yang bisa lihat notifikasi
     */
    @Get()
    @Roles(UserRole.STAF, UserRole.KEPALA_KLINIK)
    findAll() {
        return this.notificationsService.findAll();
    }
}