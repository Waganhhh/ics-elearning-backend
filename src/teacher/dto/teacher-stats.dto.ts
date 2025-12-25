export interface TeacherDashboardStats {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  revenueGrowth: number;
  studentGrowth: number;
  revenueChart: {
    labels: string[];
    data: number[];
  };
  recentEnrollments: {
    id: string;
    studentName: string;
    courseName: string;
    createdAt: Date;
  }[];
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  byCourse: {
    courseId: string;
    courseName: string;
    earnings: number;
    enrollments: number;
  }[];
}
