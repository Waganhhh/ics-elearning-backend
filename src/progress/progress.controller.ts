import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('overview')
  getOverview(@Req() req: any) {
    return this.progressService.getOverview(req.user.userId);
  }

  @Get('weekly')
  getWeeklyProgress(@Req() req: any) {
    return this.progressService.getWeeklyProgress(req.user.userId);
  }

  @Get('courses')
  getAllCourseProgress(@Req() req: any) {
    return this.progressService.getAllCourseProgress(req.user.userId);
  }

  @Get('course/:courseId')
  getCourseProgress(@Param('courseId') courseId: string, @Req() req: any) {
    return this.progressService.getCourseProgress(req.user.userId, courseId);
  }

  @Get('achievements')
  getAchievements(@Req() req: any) {
    return this.progressService.getAchievements(req.user.userId);
  }
}
