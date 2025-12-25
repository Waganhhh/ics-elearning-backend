import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  create(@Body() createDiscussionDto: CreateDiscussionDto, @Req() req: any) {
    return this.discussionsService.create(createDiscussionDto, req.user.userId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.discussionsService.findByCourse(courseId);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.discussionsService.findByLesson(lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discussionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscussionDto: UpdateDiscussionDto) {
    return this.discussionsService.update(id, updateDiscussionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discussionsService.remove(id);
  }

  @Post(':id/reply')
  createReply(
    @Param('id') id: string,
    @Body() createDiscussionDto: CreateDiscussionDto,
    @Req() req: any,
  ) {
    return this.discussionsService.createReply(id, createDiscussionDto, req.user.userId);
  }

  @Patch(':id/resolve')
  toggleResolved(@Param('id') id: string) {
    return this.discussionsService.toggleResolved(id);
  }

  @Patch(':id/pin')
  togglePinned(@Param('id') id: string) {
    return this.discussionsService.togglePinned(id);
  }
}
