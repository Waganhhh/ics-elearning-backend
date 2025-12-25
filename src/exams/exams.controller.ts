import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // ==================== TEACHER ENDPOINTS ====================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() createExamDto: any, @Request() req) {
    return this.examsService.create(createExamDto, req.user.id);
  }

  @Get('my-exams')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findMyExams(@Request() req) {
    return this.examsService.findMyExams(req.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateExamDto: any, @Request() req) {
    return this.examsService.update(id, updateExamDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.examsService.delete(id, req.user.id);
  }

  @Post(':id/submit-for-approval')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  submitForApproval(@Param('id') id: string, @Request() req) {
    return this.examsService.submitForApproval(id, req.user.id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.examsService.findAll();
  }

  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.examsService.findPending();
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.examsService.approve(id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.examsService.reject(id, body.reason);
  }

  // ==================== STUDENT ENDPOINTS ====================

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  findAvailable(@Request() req) {
    return this.examsService.findAvailable(req.user.id);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.examsService.findByCourse(courseId);
  }

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  startExam(@Body() body: { examId: string }, @Request() req) {
    return this.examsService.startExam(body.examId, req.user.id);
  }

  @Post('submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  submitExam(@Body() body: any, @Request() req) {
    return this.examsService.submitExam(body.attemptId, req.user.id, body.answers);
  }

  @Get('my-attempts')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  getMyAttempts(@Request() req) {
    return this.examsService.getMyAttempts(req.user.id);
  }

  @Get('attempt/:attemptId/result')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  getAttemptResult(@Param('attemptId') attemptId: string, @Request() req) {
    return this.examsService.getAttemptResult(attemptId, req.user.id);
  }

  // ==================== PUBLIC ENDPOINTS ====================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }
}

