import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * ✅ FIX: Root endpoint tidak perlu guard (public endpoint untuk health check)
 * Tapi jika ingin protected, uncomment UseGuards
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Public endpoint untuk cek server status
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}