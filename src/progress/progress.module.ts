import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from '../lesson-progress/entities/lesson-progress.entity';
import { Certificate } from '../certificates/entities/certificate.entity';
import { Lesson } from '../lessons/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, LessonProgress, Certificate, Lesson]),
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
