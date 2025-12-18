import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, student: User): Promise<Payment> {
    const course = await this.courseRepository.findOne({
      where: { id: createPaymentDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: student.id,
        courseId: createPaymentDto.courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const transactionId = this.generateTransactionId();

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      transactionId,
      studentId: student.id,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async processPayment(paymentId: string, success: boolean, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (success) {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();

      // Create enrollment after successful payment
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          studentId: payment.studentId,
          courseId: payment.courseId,
        },
      });

      if (!existingEnrollment) {
        const enrollment = this.enrollmentRepository.create({
          studentId: payment.studentId,
          courseId: payment.courseId,
        });
        await this.enrollmentRepository.save(enrollment);
      }
    } else {
      payment.status = PaymentStatus.FAILED;
      if (reason) {
        payment.failureReason = reason;
      }
    }

    return this.paymentRepository.save(payment);
  }

  async findByStudent(studentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { studentId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['course', 'student'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByTransactionId(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['course', 'student'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }
}
