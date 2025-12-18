import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt, AttemptStatus } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createQuizDto: CreateQuizDto, user: User): Promise<Quiz> {
    const course = await this.courseRepository.findOne({
      where: { id: createQuizDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id) {
      throw new ForbiddenException('You can only create quizzes for your own courses');
    }

    const quiz = this.quizRepository.create(createQuizDto);
    return this.quizRepository.save(quiz);
  }

  async findByCourse(courseId: string): Promise<Quiz[]> {
    return this.quizRepository.find({
      where: { courseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course', 'lesson'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: Partial<CreateQuizDto>, user: User): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && quiz.course.teacherId !== user.id) {
      throw new ForbiddenException('You can only update quizzes for your own courses');
    }

    Object.assign(quiz, updateQuizDto);
    return this.quizRepository.save(quiz);
  }

  async remove(id: string, user: User): Promise<void> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && quiz.course.teacherId !== user.id) {
      throw new ForbiddenException('You can only delete quizzes for your own courses');
    }

    await this.quizRepository.remove(quiz);
  }

  async startAttempt(quizId: string, student: User): Promise<QuizAttempt> {
    const quiz = await this.findOne(quizId);

    // Check previous attempts
    const previousAttempts = await this.attemptRepository.count({
      where: {
        quizId,
        studentId: student.id,
        status: AttemptStatus.COMPLETED,
      },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    const attempt = this.attemptRepository.create({
      quizId,
      studentId: student.id,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    return this.attemptRepository.save(attempt);
  }

  async submitAttempt(
    attemptId: string,
    submitQuizDto: SubmitQuizDto,
    student: User,
  ): Promise<QuizAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz'],
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.studentId !== student.id) {
      throw new ForbiddenException('Access denied');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Quiz attempt already completed');
    }

    // Calculate score
    const { score, passed } = this.calculateScore(attempt.quiz, submitQuizDto.answers);

    attempt.answers = submitQuizDto.answers;
    attempt.score = score;
    attempt.passed = passed;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.completedAt = new Date();

    if (attempt.startedAt) {
      const timeSpent = Math.floor(
        (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
      );
      attempt.timeSpent = timeSpent;
    }

    return this.attemptRepository.save(attempt);
  }

  async getAttempts(quizId: string, student: User): Promise<QuizAttempt[]> {
    return this.attemptRepository.find({
      where: {
        quizId,
        studentId: student.id,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getAttempt(attemptId: string, student: User): Promise<QuizAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz'],
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.studentId !== student.id) {
      throw new ForbiddenException('Access denied');
    }

    return attempt;
  }

  private calculateScore(quiz: Quiz, answers: any[]): { score: number; passed: boolean } {
    const questions = quiz.questions;
    let correctAnswers = 0;

    questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      if (this.isAnswerCorrect(question, studentAnswer)) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= quiz.passingScore;

    return { score, passed };
  }

  private isAnswerCorrect(question: any, studentAnswer: any): boolean {
    if (question.type === 'multiple-choice') {
      return question.correctAnswer === studentAnswer;
    } else if (question.type === 'multiple-select') {
      const correctAnswers = question.correctAnswers || [];
      const studentAnswers = studentAnswer || [];
      return (
        correctAnswers.length === studentAnswers.length &&
        correctAnswers.every((a: any) => studentAnswers.includes(a))
      );
    } else if (question.type === 'true-false') {
      return question.correctAnswer === studentAnswer;
    }
    return false;
  }
}
