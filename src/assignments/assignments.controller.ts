import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() createAssignmentDto: CreateAssignmentDto, @Req() req: any) {
    return this.assignmentsService.create(createAssignmentDto, req.user.userId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.assignmentsService.findByLesson(lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }

  // Submission endpoints
  @Post(':id/submit')
  submitAssignment(
    @Param('id') id: string,
    @Body() body: { content: string; attachments?: string[] },
    @Req() req: any,
  ) {
    return this.assignmentsService.submitAssignment(
      id,
      body.content,
      body.attachments || [],
      req.user.userId,
    );
  }

  @Get(':id/submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  getSubmissions(@Param('id') id: string) {
    return this.assignmentsService.getSubmissionsByAssignment(id);
  }

  @Get(':id/my-submission')
  getMySubmission(@Param('id') id: string, @Req() req: any) {
    return this.assignmentsService.getMySubmission(id, req.user.userId);
  }

  @Post('submissions/:submissionId/grade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() body: { score: number; feedback: string },
    @Req() req: any,
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      body.score,
      body.feedback,
      req.user.userId,
    );
  }
}
