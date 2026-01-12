import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Index()
  @Column()
  studentId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Index()
  @Column()
  courseId: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Index()
  @Column()
  lessonId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  timestamp: number; // Video timestamp in seconds

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
