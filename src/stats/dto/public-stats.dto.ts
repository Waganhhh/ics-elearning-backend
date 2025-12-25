export interface PublicStats {
  totalStudents: number;
  totalCourses: number;
  totalTeachers: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
  categoriesCount: number;
  topCategories: CategoryStat[];
  featuredCourses: FeaturedCourse[];
}

export interface CategoryStat {
  id: string;
  name: string;
  courseCount: number;
  enrollmentCount: number;
}

export interface FeaturedCourse {
  id: string;
  title: string;
  thumbnail: string;
  teacherName: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  enrollmentCount: number;
  level: string;
}
