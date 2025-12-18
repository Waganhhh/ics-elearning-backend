import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createLessonDto: CreateLessonDto, user: User): Promise<Lesson> {
    const course = await this.courseRepository.findOne({
      where: { id: createLessonDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id) {
      throw new ForbiddenException('You can only add lessons to your own courses');
    }

    // Get the next order number
    if (createLessonDto.order === undefined) {
      const maxOrder = await this.lessonRepository
        .createQueryBuilder('lesson')
        .where('lesson.courseId = :courseId', { courseId: createLessonDto.courseId })
        .select('MAX(lesson.order)', 'max')
        .getRawOne();

      createLessonDto.order = (maxOrder?.max || 0) + 1;
    }

    const lesson = this.lessonRepository.create(createLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: User): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && lesson.course.teacherId !== user.id) {
      throw new ForbiddenException('You can only update lessons in your own courses');
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string, user: User): Promise<void> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && lesson.course.teacherId !== user.id) {
      throw new ForbiddenException('You can only delete lessons from your own courses');
    }

    await this.lessonRepository.remove(lesson);
  }

  async reorder(courseId: string, lessonIds: string[], user: User): Promise<Lesson[]> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id) {
      throw new ForbiddenException('You can only reorder lessons in your own courses');
    }

    const lessons = await this.lessonRepository.findBy({
      id: In(lessonIds),
      courseId,
    });

    // Update order for each lesson
    const updates = lessonIds.map((id, index) => {
      const lesson = lessons.find((l) => l.id === id);
      if (lesson) {
        lesson.order = index + 1;
        return this.lessonRepository.save(lesson);
      }
      return null;
    });

    await Promise.all(updates.filter(Boolean));

    return this.findByCourse(courseId);
  }
}
