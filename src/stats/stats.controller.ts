import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('public')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // Cache for 10 minutes
  getPublicStats() {
    return this.statsService.getPublicStats();
  }
}
