export interface ProgressOverview {
  totalCoursesEnrolled: number;
  coursesInProgress: number;
  coursesCompleted: number;
  completionRate: number;
  totalLearningTime: number; // in hours
  certificatesEarned: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: number;
  timeSpent: number; // in hours
  coursesActive: number;
  quizzesTaken: number;
  averageScore: number;
  dailyActivity: DailyActivity[];
}

export interface DailyActivity {
  date: string;
  lessonsCompleted: number;
  timeSpent: number;
  active: boolean;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  teacherName: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastAccessedAt: Date;
  timeSpent: number; // in hours
  quizzesTaken: number;
  averageQuizScore: number;
  nextLesson: {
    id: string;
    title: string;
    order: number;
  } | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'completion' | 'streak' | 'quiz' | 'engagement';
}
