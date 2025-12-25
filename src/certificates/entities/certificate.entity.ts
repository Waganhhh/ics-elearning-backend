import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  certificateNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @OneToOne(() => Enrollment, (enrollment) => enrollment.certificate)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column()
  enrollmentId: string;

  @Column({ type: 'timestamp' })
  issueDate: Date;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any; // Additional certificate data

  @Column({ default: 'approved' })
  status: string; // approved, pending, rejected

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  shareId: string; // For public sharing

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
