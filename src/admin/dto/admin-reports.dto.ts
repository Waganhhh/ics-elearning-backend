export interface RevenueReport {
  totalRevenue: number;
  platformRevenue: number; // 30%
  teacherRevenue: number; // 70%
  revenueByMonth: MonthlyRevenue[];
  revenueByTeacher: TeacherRevenue[];
  revenueByCategory: CategoryRevenue[];
  averageOrderValue: number;
  refundRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

export interface TeacherRevenue {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  totalRevenue: number;
  courseCount: number;
  studentCount: number;
}

export interface CategoryRevenue {
  categoryName: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number; // logged in within 30 days
  newUsers: number; // registered within 30 days
  usersByRole: RoleDistribution[];
  userGrowth: UserGrowth[];
  topStudents: TopStudent[];
  topTeachers: TopTeacher[];
}

export interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface UserGrowth {
  period: string; // YYYY-MM or YYYY-WW
  newUsers: number;
  activeUsers: number;
}

export interface TopStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  coursesEnrolled: number;
  totalSpent: number;
  completionRate: number;
}

export interface TopTeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  coursesCreated: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export interface PerformanceReport {
  topPerformingCourses: CoursePerformance[];
  lowPerformingCourses: CoursePerformance[];
  completionRates: CompletionRate[];
  engagementMetrics: EngagementMetrics;
}

export interface CoursePerformance {
  courseId: string;
  courseTitle: string;
  teacherName: string;
  enrollments: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

export interface CompletionRate {
  categoryName: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface EngagementMetrics {
  averageTimePerCourse: number; // in hours
  averageLessonsCompleted: number;
  averageQuizScore: number;
  discussionParticipation: number; // percentage
}
