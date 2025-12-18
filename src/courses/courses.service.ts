import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto, teacher: User): Promise<Course> {
    const slug = createCourseDto.slug || this.generateSlug(createCourseDto.title);

    const existingCourse = await this.courseRepository.findOne({
      where: { slug },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this slug already exists');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      slug,
      teacherId: teacher.id,
    });

    return this.courseRepository.save(course);
  }

  async findAll(search?: string, categoryId?: string): Promise<Course[]> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED });

    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search OR course.tags::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('course.categoryId = :categoryId', { categoryId });
    }

    return queryBuilder.orderBy('course.createdAt', 'DESC').getMany();
  }

  async findFeatured(): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isFeatured: true, status: CourseStatus.PUBLISHED },
      relations: ['teacher', 'category'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async findBestsellers(): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isBestseller: true, status: CourseStatus.PUBLISHED },
      relations: ['teacher', 'category'],
      order: { enrollmentCount: 'DESC' },
      take: 10,
    });
  }

  async findByTeacher(teacherId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacherId },
      relations: ['category', 'lessons'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher', 'category', 'lessons', 'reviews'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { slug },
      relations: ['teacher', 'category', 'lessons', 'reviews'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);

    // Check permissions
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id) {
      throw new ForbiddenException('You can only update your own courses');
    }

    if (updateCourseDto.slug && updateCourseDto.slug !== course.slug) {
      const existingCourse = await this.courseRepository.findOne({
        where: { slug: updateCourseDto.slug },
      });

      if (existingCourse && existingCourse.id !== id) {
        throw new ConflictException('Course with this slug already exists');
      }
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string, user: User): Promise<void> {
    const course = await this.findOne(id);

    // Check permissions
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.courseRepository.remove(course);
  }

  async updateRating(courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['reviews'],
    });

    if (!course) return;

    const publishedReviews = course.reviews.filter((r) => r.isPublished);
    const reviewCount = publishedReviews.length;

    if (reviewCount > 0) {
      const totalRating = publishedReviews.reduce((sum, r) => sum + r.rating, 0);
      course.rating = totalRating / reviewCount;
      course.reviewCount = reviewCount;
    } else {
      course.rating = 0;
      course.reviewCount = 0;
    }

    await this.courseRepository.save(course);
  }

  async incrementEnrollmentCount(courseId: string): Promise<void> {
    await this.courseRepository.increment({ id: courseId }, 'enrollmentCount', 1);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
