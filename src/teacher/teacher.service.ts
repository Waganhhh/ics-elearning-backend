import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Review } from '../reviews/entities/review.entity';
import { TeacherDashboardStats, EarningsData } from './dto/teacher-stats.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async getDashboardStats(teacherId: string): Promise<TeacherDashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get teacher courses
    const courses = await this.courseRepo.find({
      where: { teacherId },
    });
    const courseIds = courses.map(c => c.id);

    // Total revenue
    const payments = await this.paymentRepo.find({
      where: {
        courseId: courseIds.length > 0 ? courseIds[0] : undefined,
        status: PaymentStatus.COMPLETED,
      },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.finalAmount, 0);

    // Recent revenue for growth
    const recentRevenue = payments
      .filter(p => p.createdAt >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.finalAmount, 0);
    const oldRevenue = payments
      .filter(p => p.createdAt >= sixtyDaysAgo && p.createdAt < thirtyDaysAgo)
      .reduce((sum, p) => sum + p.finalAmount, 0);
    const revenueGrowth = oldRevenue > 0 ? ((recentRevenue - oldRevenue) / oldRevenue) * 100 : 0;

    // Total students (unique enrollments)
    const totalStudents = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.studentId)', 'count')
      .where('enrollment.courseId IN (:...courseIds)', { courseIds: courseIds.length > 0 ? courseIds : [''] })
      .getRawOne();

    // Recent students for growth
    const [recentStudents, oldStudents] = await Promise.all([
      this.enrollmentRepo
        .createQueryBuilder('enrollment')
        .select('COUNT(DISTINCT enrollment.studentId)', 'count')
        .where('enrollment.courseId IN (:...courseIds)', { courseIds: courseIds.length > 0 ? courseIds : [''] })
        .andWhere('enrollment.createdAt >= :date', { date: thirtyDaysAgo })
        .getRawOne(),
      this.enrollmentRepo
        .createQueryBuilder('enrollment')
        .select('COUNT(DISTINCT enrollment.studentId)', 'count')
        .where('enrollment.courseId IN (:...courseIds)', { courseIds: courseIds.length > 0 ? courseIds : [''] })
        .andWhere('enrollment.createdAt >= :start', { start: sixtyDaysAgo })
        .andWhere('enrollment.createdAt < :end', { end: thirtyDaysAgo })
        .getRawOne(),
    ]);

    const studentGrowth = parseInt(oldStudents.count) > 0
      ? ((parseInt(recentStudents.count) - parseInt(oldStudents.count)) / parseInt(oldStudents.count)) * 100
      : 0;

    // Average rating
    const reviews = await this.reviewRepo.find({
      where: { courseId: courseIds.length > 0 ? courseIds[0] : undefined },
    });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Revenue chart (last 7 days)
    const revenueChart = await this.getRevenueChart(teacherId, 7);

    // Recent enrollments
    const recentEnrollments = await this.getRecentEnrollments(teacherId);

    return {
      totalRevenue,
      totalStudents: parseInt(totalStudents.count) || 0,
      totalCourses: courses.length,
      averageRating: Math.round(averageRating * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      studentGrowth: Math.round(studentGrowth * 10) / 10,
      revenueChart,
      recentEnrollments,
    };
  }

  async getRevenueChart(teacherId: string, days: number = 7) {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    const courses = await this.courseRepo.find({ where: { teacherId } });
    const courseIds = courses.map(c => c.id);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const dayRevenue = await this.paymentRepo
        .createQueryBuilder('payment')
        .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
        .andWhere('payment.courseId IN (:...courseIds)', { courseIds: courseIds.length > 0 ? courseIds : [''] })
        .andWhere('payment.createdAt >= :start', { start: date })
        .andWhere('payment.createdAt < :end', { end: nextDate })
        .getMany();

      const total = dayRevenue.reduce((sum, p) => sum + p.finalAmount, 0);

      labels.push(date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
      data.push(total);
    }

    return { labels, data };
  }

  async getRecentEnrollments(teacherId: string, limit: number = 10) {
    const courses = await this.courseRepo.find({ where: { teacherId } });
    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { courseId: courseIds.length > 0 ? courseIds[0] : undefined },
      relations: ['student', 'course'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return enrollments.map(e => ({
      id: e.id,
      studentName: e.student.name,
      courseName: e.course.title,
      createdAt: e.createdAt,
    }));
  }

  async getEarnings(teacherId: string): Promise<EarningsData> {
    const courses = await this.courseRepo.find({
      where: { teacherId },
    });

    const courseIds = courses.map(c => c.id);
    if (courseIds.length === 0) {
      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        byCourse: [],
      };
    }

    // Get all completed payments
    const payments = await this.paymentRepo.find({
      where: {
        status: PaymentStatus.COMPLETED,
      },
      relations: ['course'],
    });

    const teacherPayments = payments.filter(p => courseIds.includes(p.courseId));
    const totalEarnings = teacherPayments.reduce((sum, p) => sum + p.finalAmount, 0);

    // For simplicity, assume 70% goes to teacher, 30% to platform
    const teacherCut = totalEarnings * 0.7;
    
    // Earnings by course
    const byCourse = courses.map(course => {
      const coursePayments = teacherPayments.filter(p => p.courseId === course.id);
      const earnings = coursePayments.reduce((sum, p) => sum + p.finalAmount, 0) * 0.7;
      
      return {
        courseId: course.id,
        courseName: course.title,
        earnings: Math.round(earnings),
        enrollments: coursePayments.length,
      };
    });

    return {
      totalEarnings: Math.round(teacherCut),
      pendingEarnings: 0, // Could track pending payouts
      paidEarnings: Math.round(teacherCut),
      byCourse,
    };
  }

  async getStudentList(teacherId: string) {
    const courses = await this.courseRepo.find({ where: { teacherId } });
    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return { data: [], total: 0 };
    }

    const enrollments = await this.enrollmentRepo.find({
      relations: ['student', 'course'],
      order: { createdAt: 'DESC' },
    });

    const teacherEnrollments = enrollments.filter(e => courseIds.includes(e.courseId));

    // Group by student
    const studentMap = new Map();
    teacherEnrollments.forEach(e => {
      if (!studentMap.has(e.studentId)) {
        studentMap.set(e.studentId, {
          id: e.studentId,
          name: e.student.name,
          email: e.student.email,
          avatar: e.student.avatar,
          enrolledCourses: [],
          totalProgress: 0,
          enrollmentCount: 0,
        });
      }
      const student = studentMap.get(e.studentId);
      student.enrolledCourses.push({
        courseId: e.courseId,
        courseName: e.course.title,
        progress: e.progress,
        status: e.status,
      });
      student.totalProgress += e.progress;
      student.enrollmentCount += 1;
    });

    const students = Array.from(studentMap.values()).map(s => ({
      ...s,
      averageProgress: Math.round(s.totalProgress / s.enrollmentCount),
    }));

    return {
      data: students,
      total: students.length,
    };
  }

  async exportStudentsToCSV(teacherId: string): Promise<string> {
    const { data } = await this.getStudentList(teacherId);

    const headers = ['Student Name', 'Email', 'Enrolled Courses', 'Average Progress'];
    const rows = data.map(s => [
      s.name,
      s.email,
      s.enrollmentCount,
      `${s.averageProgress}%`,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  async exportEarningsToCSV(teacherId: string): Promise<string> {
    const earnings = await this.getEarnings(teacherId);

    const headers = ['Course Name', 'Enrollments', 'Earnings (VND)'];
    const rows = earnings.byCourse.map(c => [
      c.courseName,
      c.enrollments,
      c.earnings,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `Total Earnings,${earnings.totalEarnings}`,
    ].join('\n');
  }
}
