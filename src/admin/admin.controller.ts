import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/growth')
  getGrowthStats() {
    return this.adminService.getGrowthStats();
  }

  @Get('dashboard/categories/distribution')
  getCategoryDistribution() {
    return this.adminService.getCategoryDistribution();
  }

  @Get('reports/revenue')
  getRevenueReport() {
    return this.adminService.getRevenueReport();
  }

  @Get('reports/users')
  getUserReport() {
    return this.adminService.getUserReport();
  }

  @Get('reports/performance')
  getPerformanceReport() {
    return this.adminService.getPerformanceReport();
  }
}
